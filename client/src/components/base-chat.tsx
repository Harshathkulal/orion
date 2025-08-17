"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  FormEvent,
} from "react";
import TextInput from "@/components/text-input";
import TextContent from "@/components/text-content";
import LoginDialog from "@/components/login-dialog";
import { Message, BaseChatProps } from "@/types/types";
import { useAuth } from "@/lib/auth/use-session";

export default function BaseChat({
  apiEndpoint,
  maxFreeMessages = 3,
  additionalProps = {},
}: BaseChatProps) {
  const { isAuthenticated } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initial, setInitial] = useState(true);

  const abortControllerRef = useRef<AbortController | null>(null);

  const cleanup = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  // Cleanup on component unmount
  useEffect(() => cleanup, [cleanup]);

  // Show error message and update messages state
  const showError = useCallback((message: string) => {
    setError(message);
    setMessages((prev) => [
      ...prev,
      { role: "model", content: message, isError: true },
    ]);
    setLoading(false);
  }, []);

  // Handle streaming response from the API
  const handleStreamingResponse = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    userMessage: Message
  ) => {
    let responseText = "";
    const modelMessage: Message = { role: "model", content: "" };

    setMessages((prev) => [...prev, modelMessage]);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        try {
          const json = JSON.parse(chunk);
          if (json.error) throw new Error(json.error);
        } catch {
          responseText += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role === "model") last.content = responseText;
            return updated;
          });
        }
      }

      setConversationHistory((prev) => [
        ...prev,
        userMessage,
        { ...modelMessage, content: responseText },
      ]);
    } finally {
      reader.releaseLock();
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmed = question.trim();
    if (!trimmed) return;

    if (!isAuthenticated && messageCount >= maxFreeMessages) {
      setShowLoginDialog(true);
      return;
    }

    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setConversationHistory((prev) => [...prev, userMessage]);
    setInitial(false);
    setLoading(true);
    setError(null);
    setQuestion("");

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          conversationHistory,
          ...additionalProps,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong.");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      await handleStreamingResponse(reader, userMessage);

      if (!isAuthenticated) {
        setMessageCount((prev) => {
          const next = prev + 1;
          if (next >= maxFreeMessages) setShowLoginDialog(true);
          return next;
        });
      }
    } catch (err) {
      console.error("Submit error:", err);
      showError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  // Handle stop action
  const handleStop = () => cleanup();

  return (
    <div id="baseChat" data-testid="base-chat" className="flex flex-col h-full max-w-4xl mx-auto w-full">
      <div className="flex-1">
        <TextContent
          messages={messages}
          loading={loading}
          initial={initial}
          error={error}
        />
      </div>
      <div className="sticky bottom-0 bg-background z-10">
        <TextInput
          question={question}
          setQuestion={setQuestion}
          onSubmit={handleSubmit}
          loading={loading}
          handleStop={handleStop}
        />
      </div>
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </div>
  );
}

import React, { useState, useCallback, useEffect, useRef } from "react";
import TextInput from "@/components/text-input";
import TextContent from "@/components/text-content";
import LoginDialog from "@/components/login-dialog";
import { Message } from "@/types/types";
import { useAuth } from "@clerk/nextjs";

interface BaseChatProps {
  apiEndpoint: string;
  maxFreeMessages?: number;
  additionalProps?: Record<string, unknown>;
  onMessageSubmit?: (question: string, conversationHistory: Message[]) => Promise<{ response: string }>;
  customMessageTransform?: (response: { response: string }) => string;
}

export default function BaseChat({
  apiEndpoint,
  maxFreeMessages = 3,
  additionalProps = {},
  onMessageSubmit,
  customMessageTransform,
}: BaseChatProps) {
  const { isSignedIn } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setMessages((prev) => [
      ...prev,
      { role: "model", content: errorMessage, isError: true },
    ]);
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignedIn && messageCount >= maxFreeMessages) {
      setShowLoginDialog(true);
      return;
    }

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    setError(null);
    const userMessage: Message = { role: "user", content: trimmedQuestion };
    setMessages((prev) => [...prev, userMessage]);
    setInitial(false);
    setLoading(true);
    setQuestion("");

    try {
      let response;
      if (onMessageSubmit) {
        response = await onMessageSubmit(trimmedQuestion, conversationHistory);
        const modelMessage: Message = {
          role: "model",
          content: customMessageTransform ? customMessageTransform(response) : response.response,
        };
        setMessages((prev) => [...prev, modelMessage]);
        setConversationHistory((prev) => [...prev, userMessage, modelMessage]);
      } else {
        const fetchResponse = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: trimmedQuestion,
            conversationHistory,
            ...additionalProps,
          }),
        });

        if (!fetchResponse.ok) {
          const errorData = await fetchResponse.json();
          throw new Error(errorData.error || "Something went wrong.");
        }

        // Handle streaming response
        const reader = fetchResponse.body?.getReader();
        if (!reader) throw new Error("No response stream available");

        let responseText = "";
        // Add initial empty model message
        const modelMessage: Message = { role: "model", content: "" };
        setMessages((prev) => [...prev, modelMessage]);

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // Convert the Uint8Array to text
            const text = new TextDecoder().decode(value);
            
            // Check if the response is an error message
            try {
              const jsonResponse = JSON.parse(text);
              if (jsonResponse.error) {
                throw new Error(jsonResponse.error);
              }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
              // If it's not JSON or doesn't have an error, treat it as normal text
              responseText += text;
              
              // Update the last message in real-time
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === "model") {
                  lastMessage.content = responseText;
                }
                return [...newMessages];
              });

              // Force a re-render
              setLoading((prev) => prev);
            }
          }
        } finally {
          reader.releaseLock();
        }

        // Update conversation history with the final message
        setConversationHistory((prev) => [...prev, userMessage, { ...modelMessage, content: responseText }]);
      }

      if (!isSignedIn) {
        setMessageCount((prev) => prev + 1);
        if (messageCount + 1 >= maxFreeMessages) setShowLoginDialog(true);
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      handleError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = () => {
    cleanup();
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
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
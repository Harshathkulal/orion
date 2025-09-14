import { useState, useRef, useCallback, FormEvent } from "react";
import { Message } from "@/types/types";
import { sendMessage, streamResponse } from "@/services/chatService";
import { useAuth } from "@/lib/auth/use-session";

export function useChat(
  apiEndpoint: string,
  maxFreeMessages = 3,
  additionalProps = {}
) {
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

  const showError = useCallback((message: string) => {
    setError(message);
    setMessages((prev) => [
      ...prev,
      { role: "model", content: message, isError: true },
    ]);
    setLoading(false);
  }, []);

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
      const response = await sendMessage(apiEndpoint, {
        question: trimmed,
        conversationHistory,
        ...additionalProps,
      });

      const modelMessage: Message = { role: "model", content: "" };
      setMessages((prev) => [...prev, modelMessage]);

      const finalText = await streamResponse(response, (text) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "model") last.content = text;
          return updated;
        });
      });

      setConversationHistory((prev) => [
        ...prev,
        userMessage,
        { role: "model", content: finalText },
      ]);

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

  return {
    messages,
    question,
    setQuestion,
    loading,
    initial,
    error,
    showLoginDialog,
    setShowLoginDialog,
    handleSubmit,
    handleStop: cleanup,
  };
}

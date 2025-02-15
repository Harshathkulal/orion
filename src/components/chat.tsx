"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import TextInput from "@/components/text-input";
import TextContent from "./text-content";
import LoginDialog from "./login-dialog";
import { Message } from "@/types/types";

const MAX_FREE_MESSAGES = 3;
const API_ENDPOINT = "/api/text";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function for aborting previous requests
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (messageCount >= MAX_FREE_MESSAGES) {
      setShowLoginDialog(true);
      return;
    }

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    // Add user's message immediately
    setMessages((prev: Message[]) => [
      ...prev,
      { role: "user", content: trimmedQuestion },
    ]);
    setInitial(false);
    setLoading(true);
    setError(null);
    setQuestion("");

    let currentResponse = "";
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const conversationHistory = messages.length > 0 ? messages : [];

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmedQuestion,
          conversationHistory,
        }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("ReadableStream not supported");

      const decoder = new TextDecoder();

      // Add assistant message placeholder
      setMessages((prev: Message[]) => [
        ...prev,
        { role: "model", content: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        currentResponse += decoder.decode(value, { stream: true });

        // Update last assistant message with streaming content
        setMessages((prev: Message[]) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: "model",
            content: currentResponse,
          };
          return newMessages;
        });
      }

      setMessageCount((prev: number) => prev + 1);
      if (messageCount + 1 >= MAX_FREE_MESSAGES) setShowLoginDialog(true);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error && err.name === "AbortError"
          ? "Response was stopped."
          : "Failed to get response.";
      setError(errorMsg);

      setMessages((prev: Message[]) => [
        ...prev,
        { role: "model", content: currentResponse || errorMsg },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = () => {
    cleanup();
    setLoading(false);
    setError("Response was stopped.");
  };

  return (
    <div className="flex flex-col flex-1">
      <TextContent
        messages={messages}
        loading={loading}
        initial={initial}
        error={error}
      />
      <TextInput
        question={question}
        setQuestion={setQuestion}
        onSubmit={handleSubmit}
        loading={loading}
        handleStop={handleStop}
      />
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </div>
  );
}

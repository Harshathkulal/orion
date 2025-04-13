"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import TextInput from "@/components/text-input";
import TextContent from "./text-content";
import LoginDialog from "./login-dialog";
import { Message } from "@/types/types";
import { useAuth } from "@clerk/nextjs";

const MAX_FREE_MESSAGES = 3;
const API_ENDPOINT = "/api/text";

export default function ChatPage() {
  const { isSignedIn } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Store valid conversation history separately from UI messages
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);

  // Unified error handling function
  const handleError = useCallback((errorMessage: string) => {
    // Set error state
    setError(errorMessage);

    // Add error message to the conversation
    setMessages((prev: Message[]) => [
      ...prev,
      { role: "model", content: errorMessage, isError: true },
    ]);

    // End loading state
    setLoading(false);
  }, []);

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

    // Only check message limit for users who aren't signed in
    if (!isSignedIn && messageCount >= MAX_FREE_MESSAGES) {
      setShowLoginDialog(true);
      return;
    }

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    // Reset error state when user sends a new message
    setError(null);

    // Add user's message immediately to UI
    const userMessage: Message = { role: "user", content: trimmedQuestion };
    setMessages((prev: Message[]) => [...prev, userMessage]);
    setInitial(false);
    setLoading(true);
    setQuestion("");

    let currentResponse = "";
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmedQuestion,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Something went wrong. Please try again.";
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If JSON parsing fails, use default error message
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader)
        throw new Error("Your browser doesn't support streaming responses.");

      const decoder = new TextDecoder();

      // Add assistant message placeholder to UI
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

      // Only add successful messages to conversation history
      const modelMessage: Message = { role: "model", content: currentResponse };
      setConversationHistory((prev) => [...prev, userMessage, modelMessage]);

      // Only increment message count for non-signed-in users
      if (!isSignedIn) {
        setMessageCount((prev: number) => prev + 1);
        if (messageCount + 1 >= MAX_FREE_MESSAGES) setShowLoginDialog(true);
      }
    } catch (err: unknown) {
      // Unified error handling
      const errorMsg =
        err instanceof Error && err.name === "AbortError"
          ? "Response was stopped."
          : err instanceof Error
          ? err.message
          : "Unable to process your request. Please try again.";

      handleError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = () => {
    cleanup();
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

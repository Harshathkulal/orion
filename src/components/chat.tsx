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
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use default error message
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("ReadableStream not supported");

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
      setConversationHistory(prev => [...prev, userMessage, modelMessage]);

      // Only increment message count for non-signed-in users
      if (!isSignedIn) {
        setMessageCount((prev: number) => prev + 1);
        if (messageCount + 1 >= MAX_FREE_MESSAGES) setShowLoginDialog(true);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error && err.name === "AbortError"
          ? "Response was stopped."
          : err instanceof Error
          ? err.message
          : "Failed to get response.";

      // Add error message to UI only
      setMessages((prev: Message[]) => [
        ...prev,
        { role: "model", content: `Error: ${errorMsg}`, isError: true },
      ]);

      // Set error state for immediate display
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = () => {
    cleanup();
    setLoading(false);
    
    // Add stop message to UI only
    setMessages((prev: Message[]) => [
      ...prev,
      { role: "model", content: "Response was stopped.", isError: true },
    ]);
    
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
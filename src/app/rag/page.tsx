"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import TextInput from "@/components/text-input";
import TextContent from "@/components/text-content";
import LoginDialog from "@/components/login-dialog";
import Navbar from "@/components/navbar";
import { Message } from "@/types/types";
import { useAuth } from "@clerk/nextjs";

const MAX_FREE_MESSAGES = 3;
const API_ENDPOINT = "/api/rag";
const COLLECTION_NAME = "my-collection";

export default function ChatPage() {
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

    if (!isSignedIn && messageCount >= MAX_FREE_MESSAGES) {
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
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmedQuestion,
          collectionName: COLLECTION_NAME,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong.");
      }

      const data = await response.json();

      const modelMessage: Message = { role: "model", content: data.response };
      setMessages((prev) => [...prev, modelMessage]);
      setConversationHistory((prev) => [...prev, userMessage, modelMessage]);

      if (!isSignedIn) {
        setMessageCount((prev) => prev + 1);
        if (messageCount + 1 >= MAX_FREE_MESSAGES) setShowLoginDialog(true);
      }
    } catch (err) {
      handleError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = () => {
    cleanup();
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col flex-1">
        <TextContent
          messages={messages}
          loading={loading}
          initial={initial}
          error={error}
          rag={"rag"}
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
    </>
  );
}

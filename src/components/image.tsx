"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import TextInput from "@/components/text-input";
import ImageContent from "./image-content";
import LoginDialog from "./login-dialog";
import { useAuth } from "@clerk/nextjs";

const MAX_FREE_MESSAGES = 3;
const API_ENDPOINT = "/api/image";

export default function ImagePage() {
  const { isSignedIn } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function for aborting previous requests
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const handleStop = () => {
    cleanup();
    setLoading(false);
    setError("Generation was stopped.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only check message limit for users who aren't signed in
    if (!isSignedIn && messageCount >= MAX_FREE_MESSAGES) {
      setShowLoginDialog(true);
      return;
    }

    if (!prompt.trim()) {
      return;
    }

    setInitial(false);
    setLoading(true);
    setError(null);
    setImageUrl(null);

    // Create new AbortController for this request
    cleanup();
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const data = await response.json();
      setImageUrl(data.url);
      setMessageCount((prev) => prev + 1);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        setError(
          error.message || "An error occurred while generating the image"
        );
        console.error(error);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <ImageContent
        initial={initial}
        loading={loading}
        error={error}
        imageUrl={imageUrl}
      />
      <TextInput
        question={prompt}
        setQuestion={setPrompt}
        onSubmit={handleSubmit}
        loading={loading}
        handleStop={handleStop}
      />
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </div>
  );
}

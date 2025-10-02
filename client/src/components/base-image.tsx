"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import TextInput from "@/components/text-input";
import ImageContent from "./image-content";
import LoginDialog from "./login-dialog";
import { useAuth } from "@/lib/auth/use-session";
import { BaseImageProps } from "@/types/types";
import { generateImage } from "@/services/imageService";

export default function BaseImage({
  apiEndpoint,
  maxFreeMessages = 3,
  additionalProps = {},
  onImageGenerated,
}: BaseImageProps) {
  const { isAuthenticated } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on component unmount
  useEffect(() => cleanup, [cleanup]);

  const handleStop = () => {
    cleanup();
    setLoading(false);
    setError("Generation was stopped.");
  };

  const handleSubmit = async ({ question }: { question: string }) => {
    if (!isAuthenticated && messageCount >= maxFreeMessages) {
      setShowLoginDialog(true);
      return;
    }

    if (!prompt.trim()) return;

    setInitial(false);
    setLoading(true);
    setError(null);
    setImageUrl(null);

    cleanup();
    abortControllerRef.current = new AbortController();

    try {
      const url = await generateImage({
        apiEndpoint,
        prompt: question,
        additionalProps,
        signal: abortControllerRef.current.signal,
      });

      setImageUrl(url);
      onImageGenerated?.(url);

      if (!isAuthenticated) {
        setMessageCount((prev) => prev + 1);
        if (messageCount + 1 >= maxFreeMessages) {
          setShowLoginDialog(true);
        }
      }
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
    <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full">
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

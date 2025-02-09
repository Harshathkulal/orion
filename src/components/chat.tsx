"use client";

import React, { useState, useRef, useCallback } from "react";
import TextInput from "@/components/text-input";
import TextContent from "./text-content";

export default function ChatPage() {
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [initial, setInitial] = useState<boolean>(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Don't submit if question is empty or only whitespace
      if (!question.trim()) return;

      // Abort any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create a new abort controller
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setInitial(false);
      setLoading(true);
      setAnswer("");

      try {
        const response = await fetch("/api/text", {
          method: "POST",
          signal,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error("ReadableStream not supported");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });

          // Update answer immediately
          setAnswer((prevAnswer) => prevAnswer + chunk);
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            console.log("Request was aborted");
          } else {
            console.error("Error submitting:", error);
            setAnswer("An error occurred while generating response");
          }
        }
      } finally {
        setLoading(false);
        setQuestion("");
        abortControllerRef.current = null;
      }
    },
    [question]
  );

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col flex-1">
      <TextContent answer={answer} loading={loading} initial={initial} />
      <TextInput
        question={question}
        setQuestion={setQuestion}
        onSubmit={handleSubmit}
        loading={loading}
        handleStop={handleStop}
      />
    </div>
  );
}

"use client";
import React, { useState } from "react";
import TextInput from "@/components/text-input";
import TextContent from "./text-content";

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() === "") return;

    setLoading(true);
    setInitial(false);

    setTimeout(() => {
      setAnswer(
        `**You asked:** ${question}\n\n**AI response:** This is a sample response.`
      );
      setLoading(false);
      setQuestion("");
    }, 2000);
  };

  const handleStop = () => {
    setLoading(false);
  };

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

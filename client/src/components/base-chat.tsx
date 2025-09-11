"use client";

import React from "react";
import TextInput from "@/components/text-input";
import TextContent from "@/components/text-content";
import LoginDialog from "@/components/login-dialog";
import { BaseChatProps } from "@/types/types";
import { useChat } from "@/hooks/useChat";

export default function BaseChat({
  apiEndpoint,
  maxFreeMessages = 3,
  additionalProps = {},
}: BaseChatProps) {
  const {
    messages,
    question,
    setQuestion,
    loading,
    initial,
    error,
    showLoginDialog,
    setShowLoginDialog,
    handleSubmit,
    handleStop,
  } = useChat(apiEndpoint, maxFreeMessages, additionalProps);

  return (
    <div
      id="baseChat"
      data-testid="base-chat"
      className="flex flex-col h-full max-w-4xl mx-auto w-full"
    >
      <div className="flex-1">
        <TextContent messages={messages} loading={loading} initial={initial} error={error} />
      </div>
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

"use client";

import React from "react";
import TextInput from "@/components/text-input";
import TextContent from "@/components/text-content";
import LoginDialog from "@/components/login-dialog";
import { BaseChatProps } from "@/types/types";
import { useChat } from "@/hooks/useChat";

export default function BaseChat({
  apiEndpoint,
  conversationId,
  onConversationCreated,
}: Readonly<
  BaseChatProps & {
    conversationId?: string | null;
    onConversationCreated?: () => void;
  }
>) {
  const {
    messages,
    question,
    setQuestion,
    loading,
    error,
    showLoginDialog,
    setShowLoginDialog,
    handleSubmit,
    handleStop,
    fetchConversationLoading,
  } = useChat(apiEndpoint, {}, conversationId, onConversationCreated);

  return (
    <div
      id="baseChat"
      data-testid="base-chat"
      className="flex flex-col h-full max-w-4xl mx-auto w-full"
    >
      {fetchConversationLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <span className="animate-spin h-6 w-6 rounded-full border-2 border-muted-foreground border-t-transparent" />
          <span className="ml-2 text-muted-foreground text-sm">
            Loading conversation...
          </span>
        </div>
      )}
      <div className="flex-1">
        <TextContent messages={messages} loading={loading} error={error} />
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

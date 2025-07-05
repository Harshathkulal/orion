"use client";

import React, { useEffect, useRef } from "react";
import { TextContentProps } from "@/types/types";
import { WelcomeMessage } from "./chat/welcome-message";
import { MessageBubble } from "./chat/message-bubble";
import { LoadingIndicator, ErrorMessage } from "./chat/status-indicators";

export const TextContent: React.FC<TextContentProps> = ({
  messages,
  loading,
  initial,
  error,
  rag,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={contentRef}
      className="flex-1 w-full"
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {initial && !loading ? (
          <WelcomeMessage isRag={!!rag} />
        ) : (
          messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))
        )}
        {loading && <LoadingIndicator />}
        {error && <ErrorMessage message={error} />}
      </div>
    </div>
  );
};

export default TextContent;

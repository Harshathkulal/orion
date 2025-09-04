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
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  return (
    <div id="textContent" data-testid="text-content" className="flex-1 w-full overflow-y-auto pb-20">
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
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default TextContent;

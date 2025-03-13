"use client";
import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { Message } from "@/types/types";
import { Loader2 } from "lucide-react";

interface ImageContentProps {
  messages: Message[];
  loading: boolean;
  initial: boolean;
  error: string | null;
}

export default function ImageContent({
  messages,
  loading,
  initial,
  error
}: ImageContentProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto pb-32 pt-4 px-4">
      {initial && messages.length === 0 && !loading && (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <div className="max-w-md space-y-2">
            <Image
              src="/placeholder-image.svg"
              alt="AI Assistant"
              width={150}
              height={150}
              className="mx-auto"
            />
            <h1 className="text-2xl font-bold">AI Image Assistant</h1>
            <p className="text-muted-foreground">
              Type a prompt below to generate an image
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6 max-w-4xl mx-auto">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div 
              className={`rounded-lg p-4 max-w-md ${
                message.role === "user" 
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.role === "assistant" && message.image ? (
                <div className="space-y-2">
                  <Image
                    src={message.image}
                    alt="Generated image"
                    width={400}
                    height={400}
                    className="rounded-md w-full h-auto object-contain"
                  />
                  {message.content && (
                    <p className="text-sm mt-2">{message.content}</p>
                  )}
                </div>
              ) : (
                <p>{message.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg p-6 bg-muted flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm">Generating image...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="rounded-lg p-4 bg-destructive/10 text-destructive">
              {error}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
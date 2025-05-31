"use client";
import React, { useEffect, useRef } from "react";
import { Send, StopCircle } from "lucide-react";
import { Textarea } from "./ui/textarea"; // Keeping textarea for auto-resizing
import { Button } from "./ui/button";
import { TextInputProps } from "@/types/types";

export default function TextInput({
  question,
  setQuestion,
  onSubmit,
  loading,
  handleStop,
}: TextInputProps) {
  const isDisabled = question.trim() === "";

  // Ref for the textarea to control its resizing
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Resize the textarea based on content
  const handleResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height to auto
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set height based on content
    }
  };

  // Call the handleResize whenever question changes
  useEffect(() => {
    handleResize();
  }, [question]);

  // Handle Enter key behavior
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <div className="sticky bottom-0 w-full bg-background z-40">
      <div className="w-full p-4">
        <form onSubmit={onSubmit} className="relative">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full pr-12 resize-none transition-all duration-200 ease-in-out"
              disabled={loading}
              rows={2}
              style={{
                minHeight: "48px",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            />
            {loading ? (
              <Button
                type="button"
                onClick={handleStop}
                aria-label="Stop generation"
                className="absolute right-2 bottom-2 h-10 w-10 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm"
              >
                <StopCircle className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isDisabled}
                aria-label="Send message"
                className="absolute right-2 bottom-2 h-10 w-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
              >
                <Send className="h-5 w-5" />
              </Button>
            )}
          </div>
        </form>
        <p className="text-xs text-center mt-2">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}

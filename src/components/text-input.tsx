"use client";
import React from "react";
import { Send, StopCircle } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

interface TextInputProps {
  question: string;
  setQuestion: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  handleStop: () => void;
}

export default function TextInput({
  question,
  setQuestion,
  onSubmit,
  loading,
  handleStop,
}: TextInputProps) {
  const isDisabled = question.trim() === "";

  return (
    <div className="fixed bottom-0 w-full bg-background z-40">
      <div className="max-w-3xl mx-auto p-4 ">
        <form onSubmit={onSubmit} className="relative">
          <div className="relative">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
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
            <Button
              type="submit"
              disabled={isDisabled || loading}
              aria-label="Send message"
              className="absolute right-2 bottom-2 h-10 w-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
            >
              {loading ? (
                <StopCircle className="h-5 w-5" onClick={handleStop} />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>
        <p className="text-xs text-gray-400 text-center mt-2">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}

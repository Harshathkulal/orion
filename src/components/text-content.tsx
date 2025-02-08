import { Loader } from "lucide-react";
import React from "react";
import ReactMarkdown from "react-markdown";

interface TextContentSectionProps {
  answer: string;
  loading: boolean;
  initial: boolean;
}

export default function TextContent({
  answer,
  loading,
  initial,
}: TextContentSectionProps) {
  return (
    <div className="flex-1 h-[calc(100dvh-4rem-80px)]">
      {initial ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Welcome to the Orion!</h1>
            <p>What can I help with?</p>
          </div>
        </div>
      ) : (
        <div className="h-full overflow-y-auto px-4">
          <div className="max-w-4xl mx-auto py-4">
            <ReactMarkdown>{answer}</ReactMarkdown>
            {loading && (
              <div className="flex items-center text-gray-500 text-sm mt-4 animate-pulse">
                <Loader className="animate-spin mr-2" />
                <span>Generating...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

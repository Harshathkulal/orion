"use client";

import { Loader, Copy, Check } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface TextContentProps {
  answer: string;
  loading: boolean;
  initial: boolean;
}

export default function TextContent({
  answer,
  loading,
  initial,
}: TextContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Auto-scroll effect when new content is added
  useEffect(() => {
    if (!contentRef.current || !loading) return;

    const scrollToBottom = () => {
      if (contentRef.current) {
        contentRef.current.scrollTop = contentRef.current.scrollHeight;
      }
    };

    scrollToBottom();

    const observer = new MutationObserver(scrollToBottom);
    observer.observe(contentRef.current, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [answer, loading]);

  const handleCopy = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div
      ref={contentRef}
      className="p-4 w-full mx-auto overflow-y-auto"
      style={{ maxHeight: "calc(100vh - 100px)" }}
    >
      {initial && !loading ? (
        <div className="h-full flex items-center justify-center text-center">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Welcome!</h1>
            <p className="text-gray-600">How can I help you today?</p>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto p-4">
          <ReactMarkdown
            components={{
              code({ className, children }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");

                return match ? (
                  <div className="relative group">
                    <button
                      onClick={() => handleCopy(codeString)}
                      className="absolute right-2 top-2 p-2 rounded bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy code"
                    >
                      {copiedCode === codeString ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} className="text-gray-300" />
                      )}
                    </button>
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5">
                    {children}
                  </code>
                );
              },
            }}
          >
            {answer}
          </ReactMarkdown>

          {loading && (
            <div className="flex items-center gap-2 text-gray-500 text-sm mt-4">
              <Loader className="animate-spin" size={16} />
              <span>Generating...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

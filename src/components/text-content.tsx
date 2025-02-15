"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader, Copy, Check, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Message, TextContentProps, CodeBlockProps } from "@/types/types";

const COPY_TIMEOUT_MS = 2000;

const WelcomeMessage = () => (
  <div className="h-full flex items-center justify-center text-center">
    <div>
      <h1 className="text-2xl font-semibold mb-2">Welcome!</h1>
      <p className="text-gray-600">How can I help you today?</p>
    </div>
  </div>
);

const LoadingIndicator = () => (
  <div className="flex items-center gap-2 text-gray-500 text-sm mt-4">
    <Loader className="animate-spin" size={16} />
    <span>Generating...</span>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="flex items-center gap-2 text-red-500 text-sm mt-4 bg-red-50 dark:bg-red-900/10 p-3 rounded-md">
    <AlertCircle size={16} />
    <span>{message}</span>
  </div>
);

const CodeBlock = ({ className, children }: CodeBlockProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const codeString = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPY_TIMEOUT_MS);
  };

  return match ? (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 p-2 rounded bg-gray-700 transition-opacity"
        title="Copy code"
      >
        {isCopied ? (
          <Check size={14} className="text-green-400" />
        ) : (
          <Copy size={14} className="text-gray-300" />
        )}
      </button>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        className="rounded-md"
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5">
      {children}
    </code>
  );
};

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => (
  <div
    className={`flex ${
      message.role === "user" ? "justify-end" : "justify-start"
    } mb-4`}
  >
    <div
      className={`rounded-lg ${
        message.role === "user"
          ? "bg-gray-500/45 px-5 py-2.5 rounded-2xl"
          : "pb-2"
      }`}
    >
      <ReactMarkdown components={{ code: CodeBlock }}>
        {message.content}
      </ReactMarkdown>
    </div>
  </div>
);

export const TextContent: React.FC<TextContentProps> = ({
  messages,
  loading,
  initial,
  error,
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
      className="p-4 w-full max-w-4xl mx-auto flex flex-col"
      style={{ maxHeight: "calc(100vh - 100px)" }}
    >
      {initial && !loading ? (
        <WelcomeMessage />
      ) : (
        messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))
      )}
      {loading && <LoadingIndicator />}
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

export default TextContent;

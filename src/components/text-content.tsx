"use client";

import React from "react";
import { Loader, Copy, Check, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { TextContentProps, CodeBlockProps } from "@/types/types";
import { useEffect, useRef, useState } from "react";

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

  if (!match) {
    return (
      <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5">
        {children}
      </code>
    );
  }

  return (
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
        language="javascript"
        PreTag="div"
        className="rounded-md"
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};

const OpenLinkInNewTab = ({
  href = "",
  children,
  ...props
}: React.ComponentPropsWithRef<"a">) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 underline"
      {...props}
    >
      {children}
    </a>
  );
};

const TextContent: React.FC<TextContentProps> = ({
  answer,
  loading,
  initial,
  error,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={contentRef}
      className="p-4 w-full mx-auto overflow-y-auto"
      style={{ maxHeight: "calc(100vh - 100px)" }}
    >
      {initial && !loading ? (
        <WelcomeMessage />
      ) : (
        <div className="max-w-4xl mx-auto p-4">
          <ReactMarkdown components={{ code: CodeBlock, a: OpenLinkInNewTab }}>
            {answer}
          </ReactMarkdown>
          {loading && <LoadingIndicator />}
          {error && !loading && <ErrorMessage message={error} />}
        </div>
      )}
    </div>
  );
};

export default TextContent;

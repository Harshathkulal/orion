"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader, Clipboard, Check, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Message, TextContentProps, CodeBlockProps } from "@/types/types";

const COPY_TIMEOUT_MS = 2000;

const WelcomeMessage = () => (
  <div className="h-full flex items-center justify-center text-center p-4">
    <div>
      <h1 className="text-2xl font-semibold mb-2">Welcome!</h1>
      <p className="text-primary/60">How can I help you today?</p>
    </div>
  </div>
);

const RAGWelcomeMessage = () => (
  <div className="h-full flex items-center justify-center text-center p-4">
    <div>
      <h1 className="text-2xl font-semibold mb-2">RAG Chat</h1>
      <p className="text-primary/60">Ask questions about your documents!</p>
    </div>
  </div>
);

const LoadingIndicator = () => (
  <div className="flex items-center gap-2 text-muted-foreground text-sm mt-4 ">
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
  const languageMatch = /language-(\w+)/.exec(className || "");
  const codeString = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPY_TIMEOUT_MS);
  };

  return languageMatch ? (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-4 p-2 rounded bg-zinc-700 z-10"
        title="Copy code"
      >
        {isCopied ? (
          <Check size={14} className="text-green-400" />
        ) : (
          <Clipboard size={14} className="text-gray-300" />
        )}
      </button>
      <div className="max-w-full overflow-x-auto py-1">
        <SyntaxHighlighter
          style={vscDarkPlus}
          language="javascript"
          PreTag="div"
          className="rounded-md"
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    </div>
  ) : (
    <code className="bg-zinc-800 rounded px-1 py-0.5">{children}</code>
  );
};

const OpenLinkInNewTab = ({
  children,
  ...props
}: React.ComponentPropsWithRef<"a">) => {
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 underline"
    >
      {children}
    </a>
  );
};

const BulletPointList = ({ ...props }) => (
  <ul className="list-disc pl-4 py-2" {...props} />
);

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => (
  <div
    className={`flex ${
      message.role === "user" ? "justify-end" : "justify-start"
    } mb-4 max-w-full`}
  >
    <div
      className={`${
        message.role === "user"
          ? "bg-gray-500/45 px-5 py-2.5 rounded-2xl"
          : "pb-2"
      } max-w-full overflow-hidden`}
    >
      <ReactMarkdown
        components={{
          code: CodeBlock,
          a: OpenLinkInNewTab,
          ul: BulletPointList,
        }}
      >
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
      className="h-full w-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
      style={{ height: "calc(100vh - 100px)" }}
    >
      <div className="max-w-4xl mx-auto px-4 py-16">
        {initial && !loading ? (
          rag ? <RAGWelcomeMessage /> : <WelcomeMessage />
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

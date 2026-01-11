import React from "react";
import ReactMarkdown from "react-markdown";
import { CodeBlock } from "./code-block";
import { MessageBubbleProps } from "@/types/types";
import { Paperclip } from "lucide-react";

// Custom components for Markdown rendering
const OpenLinkInNewTab = ({
  children,
  ...props
}: React.ComponentPropsWithRef<"a">) => (
  <a
    href={props.href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-500 underline"
  >
    {children}
  </a>
);

const BulletPointList = ({ ...props }) => (
  <ul className="list-disc pl-4 py-2" {...props} />
);

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => (
  <div
    className={`flex ${
      message.role === "user" ? "justify-end" : "justify-start"
    } mb-6 max-w-full`}
  >
    <div
      className={`${
        message.role === "user"
          ? "bg-gray-500/45 px-5 py-2.5 rounded-2xl"
          : "px-5 py-3 rounded-2xl shadow-sm"
      } max-w-[85%] overflow-hidden`}
    >
      {message.fileName && message.isRag && (
        <div className="mb-2 flex items-center gap-2 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
          <Paperclip className="h-3.5 w-3.5" />
          <span className="truncate">{message.fileName}</span>
        </div>
      )}
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

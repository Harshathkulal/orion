import React, { useState } from "react";
import { Clipboard, Check } from "lucide-react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { CodeBlockProps } from "@/types/types";

const COPY_TIMEOUT_MS = 2000;

export const CodeBlock: React.FC<CodeBlockProps> = ({
  className,
  children,
  inline,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const languageMatch = /language-(\w+)/.exec(className || "");
  const language = languageMatch ? languageMatch[1] : "text";
  const codeString = String(children).replace(/\n$/, "");

  if (inline) {
    return <code className={className}>{children}</code>;
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPY_TIMEOUT_MS);
  };

  return (
    <div className="relative group">
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
      <div className="max-w-full overflow-x-auto">
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          PreTag="div"
          className="rounded-md !bg-zinc-800/50"
          customStyle={{
            margin: 0,
            padding: "1rem",
          }}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

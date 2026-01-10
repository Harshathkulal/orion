"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send, StopCircle, Paperclip, X, Loader2 } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { uploadDocument, deleteDocument } from "@/services/documentService";

interface TextInputProps {
  question: string;
  setQuestion: (q: string) => void;
  onSubmit: (payload: { question: string; fileName?: string }) => void;
  loading?: boolean;
  handleStop?: () => void;
}

export default function TextInput({
  question,
  setQuestion,
  onSubmit,
  loading = false,
  handleStop,
}: Readonly<TextInputProps>) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const isDisabled = question.trim() === "" || isUploading;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>("");

  // Auto resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(
      textareaRef.current.scrollHeight,
      200
    )}px`;
  }, [question]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selectedFile = files[0];

    setIsUploading(true);
    try {
      const fileName = await uploadDocument(selectedFile);
      toast.success(`Uploaded: ${selectedFile.name}`);
      setFile(selectedFile);
      setFileName(fileName.id);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    try {
      await deleteDocument(documentId);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Document Deleted successfully");
    } catch {
      toast.error("Delete Failed, Try again");
    }
  };

  const isSubmittingRef = useRef(false);

  const handleSend = () => {
    if (isDisabled || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    onSubmit({ question: question.trim(), fileName: fileName });
    setQuestion("");
    setFile(null);
    setFileName("");

    // Release lock after short delay to allow state to settle
    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 100);
  };

  return (
    <div className="sticky bottom-0 group/thread-bottom-container relative isolate z-40 w-full basis-auto has-data-has-thread-error:pt-2 has-data-has-thread-error:[box-shadow:var(--sharp-edge-bottom-shadow)] md:border-transparent md:pt-0 dark:border-white/20 md:dark:border-transparent print:hidden content-fade single-line flex flex-col">
      <div className="max-w-4xl mx-auto w-full p-4">
        <div className="flex items-center gap-2 rounded-2xl border border-input bg-card px-3 py-2 shadow-sm">
          <label className="cursor-pointer shrink-0 flex items-center justify-center">
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => handleFileSelect(e.target.files)}
              disabled={isUploading}
            />
            <Paperclip
              className={`h-5 w-5 ${
                isUploading
                  ? "text-muted-foreground opacity-40 cursor-not-allowed"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            />
          </label>

          <div className="flex-1 flex flex-col gap-1">
            {/* File chip */}
            {file || isUploading ? (
              <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs truncate w-[300px]">
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading…</span>
                  </>
                ) : (
                  <>
                    <span className="truncate">{file?.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        file?.name && handleDocumentDelete(file.name)
                      }
                      className="hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            ) : null}

            {/* Textarea */}
            <Textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              className="w-full resize-none border-0 focus-visible:ring-0 bg-transparent text-sm"
              rows={1}
              disabled={loading || isUploading}
              style={{ minHeight: "40px", maxHeight: "200px" }}
            />
          </div>

          {/* Send / Stop button */}
          {loading ? (
            <Button
              type="button"
              onClick={handleStop}
              className="h-9 w-9 rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              <StopCircle className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isDisabled}
              onClick={handleSend}
              className="h-9 w-9 rounded-full bg-orange-500/10 hover:bg-orange-500/20 text-foreground"
            >
              <Send className="h-5 w-5" />
            </Button>
          )}
        </div>

        <p className="text-xs text-center mt-2 text-muted-foreground">
          AI-generated response. Please verify before taking action.
        </p>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Upload, FileText, Trash2, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DocumentManagerProps } from "@/types/types";

export default function DocumentManager({
  documents,
  onDocumentSelect,
  selectedDocumentId,
  onDocumentUpload,
  onDocumentDelete,
}: DocumentManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        await onDocumentUpload(file);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="bg-mocha-50 border-b border-mocha-200">
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="document-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="document-upload"
              className="flex items-center px-2 py-1 text-xs font-medium text-white bg-mocha-800 rounded hover:bg-mocha-700 focus:outline-none focus:ring-1 focus:ring-mocha-800 cursor-pointer transition-colors"
            >
              <Upload className="w-3 h-3 mr-1" />
              {isUploading ? "Uploading..." : "Upload PDF"}
            </label>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden flex items-center gap-1 text-xs text-mocha-800 hover:text-mocha-900"
          >
            <span>Documents</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        <div
          className={`mt-2 space-y-1 ${
            isExpanded ? "block" : "hidden"
          } lg:block`}
        >
          {documents.length === 0 ? (
            <p className="text-xs text-mocha-600">
              Upload a document to get started
            </p>
          ) : (
            <div className="flex flex-col lg:flex-row lg:flex-wrap lg:gap-2">
              {documents.map((doc) => {
                const isSelected = selectedDocumentId === doc.id;

                return (
                  <div
                    key={doc.id}
                    className={`flex items-center justify-between p-2 rounded w-full`}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          onDocumentSelect(checked ? doc : undefined)
                        }
                      />
                      <FileText className="w-3.5 h-3.5 text-mocha-600" />
                      <span className="text-xs text-mocha-800">{doc.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDocumentDelete(doc.id);
                      }}
                      className="p-0.5 text-mocha-600 hover:text-mocha-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

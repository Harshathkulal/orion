"use client";

import React, { useState } from "react";
import BaseChat from "@/components/base-chat";
import DocumentManager from "@/components/document-manager";

interface Document {
  name: string;
  id: string;
  size?: number;
  uploadedAt?: Date;
}

export default function RagChatPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleDocumentUpload = async (file: File) => {
    // TODO: Implement actual file upload logic
    const newDoc: Document = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
    };
    setDocuments((prev) => [...prev, newDoc]);
  };

  const handleDocumentDelete = async (documentId: string) => {
    // TODO: Implement actual document deletion logic
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    if (selectedDocument?.id === documentId) {
      setSelectedDocument(null);
    }
  };

  const handleMessageSubmit = async (question: string) => {
    const response = await fetch("/api/rag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: question,
        collectionName: "my-collection",
        documentId: selectedDocument?.id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Something went wrong.");
    }

    return response.json();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        <div className="w-full lg:w-72 border-r flex-shrink-0">
          <div className="h-full overflow-y-auto">
            <DocumentManager
              documents={documents}
              onDocumentSelect={setSelectedDocument}
              selectedDocumentId={selectedDocument?.id}
              onDocumentUpload={handleDocumentUpload}
              onDocumentDelete={handleDocumentDelete}
            />
          </div>
        </div>
        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0 overflow-y-auto">
            <BaseChat
              apiEndpoint="/api/rag"
              maxFreeMessages={3}
              additionalProps={{
                collectionName: "my-collection",
                documentId: selectedDocument?.id,
              }}
              onMessageSubmit={handleMessageSubmit}
              customMessageTransform={(response) => response.response}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import BaseChat from "@/components/base-chat";
import DocumentManager from "@/components/document-manager";
import { Document } from "@/types/types";
import { toast } from "sonner";
import { uploadDocument, deleteDocument } from "@/services/documentService";

export default function RagChatPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );

  // Handle document selection
  const handleDocumentSelect = (doc: Document | undefined) => {
    setSelectedDocument(doc || null);
  };

  // Handle document upload
  const handleDocumentUpload = async (file: File) => {
    try {
      const newDoc = await uploadDocument(file);
      setDocuments((prev) => [...prev, newDoc]);
      toast.success("Document uploaded successfully");
    } catch {
      toast.error("Upload Failed, Try again");
    }
  };

  // Handle document deletion
  const handleDocumentDelete = async (documentId: string) => {
    try {
      await deleteDocument(documentId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
      }
      toast.success("Document Deleted successfully");
    } catch {
      toast.error("Delete Failed, Try again");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        <div className="w-full lg:w-72 border-r flex-shrink-0">
          <div className="h-full overflow-y-auto">
            <DocumentManager
              documents={documents}
              onDocumentSelect={handleDocumentSelect}
              selectedDocumentId={selectedDocument?.id}
              onDocumentUpload={handleDocumentUpload}
              onDocumentDelete={handleDocumentDelete}
            />
          </div>
        </div>
        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0 overflow-y-auto">
            <BaseChat
              apiEndpoint="/rag"
              maxFreeMessages={3}
              additionalProps={{
                collectionName: selectedDocument?.id,
                documentId: selectedDocument?.id,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

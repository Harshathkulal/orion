import React, { useState } from 'react';
import { Upload, FileText, Trash2 } from 'lucide-react';

interface Document {
  name: string;
  id: string;
  size?: number;
  uploadedAt?: Date;
}

interface DocumentManagerProps {
  documents: Document[];
  onDocumentSelect: (document: Document) => void;
  selectedDocumentId?: string;
  onDocumentUpload: (file: File) => Promise<void>;
  onDocumentDelete: (documentId: string) => Promise<void>;
}

export default function DocumentManager({
  documents,
  onDocumentSelect,
  selectedDocumentId,
  onDocumentUpload,
  onDocumentDelete,
}: DocumentManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await onDocumentUpload(file);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Documents</h2>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 px-3 py-2 bg-mocha-800 hover:bg-mocha-700 text-white rounded-lg cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload PDF</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                doc.id === selectedDocumentId
                  ? "bg-mocha-800"
                  : "hover:bg-mocha-800/50"
              }`}
              onClick={() => onDocumentSelect(doc)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-mocha-400" />
                  <span className="text-sm truncate">{doc.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDocumentDelete(doc.id);
                  }}
                  className="p-1 hover:bg-mocha-700 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-mocha-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
import React, { useState } from 'react';
import { Upload, FileText, Trash2, ChevronDown } from 'lucide-react';

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
    <div className="bg-mocha-50 border-b border-mocha-200">
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".pdf"
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
              {isUploading ? 'Uploading...' : 'Upload PDF'}
            </label>
          </div>

          {/* Mobile only dropdown toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden flex items-center gap-1 text-xs text-mocha-800 hover:text-mocha-900"
          >
            <span>Documents</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Document list - always visible on desktop, dropdown on mobile */}
        <div className={`mt-2 space-y-1 ${isExpanded ? 'block' : 'hidden'} lg:block`}>
          {documents.length === 0 ? (
            <p className="text-xs text-mocha-600">Upload a document to get started</p>
          ) : (
            <div className="flex flex-col lg:flex-row lg:flex-wrap lg:gap-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                    selectedDocumentId === doc.id
                      ? 'bg-mocha-200 border border-mocha-300'
                      : 'hover:bg-mocha-100'
                  }`}
                  onClick={() => onDocumentSelect(doc)}
                >
                  <div className="flex items-center gap-2">
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
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
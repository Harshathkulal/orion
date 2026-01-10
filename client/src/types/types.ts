export interface TextContentProps {
  messages: Message[];
  loading: boolean;
  error: string | null;
  rag?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export interface CodeBlockProps {
  className?: string;
  children?: React.ReactNode;
}

export interface TextInputProps {
  question: string;
  setQuestion: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  handleStop: () => void;
}

export interface BaseChatProps {
  apiEndpoint: string;
  maxFreeMessages?: number;
  additionalProps?: Record<string, unknown>;
}

export interface Document {
  name: string;
  id: string;
  size?: number;
  uploadedAt?: Date;
}

export interface CodeBlockProps {
  className?: string;
  children?: React.ReactNode;
  inline?: boolean;
}

export interface MessageBubbleProps {
  message: Message;
}

export interface ErrorMessageProps {
  message: string;
}

export interface WelcomeMessageProps {
  isRag?: boolean;
}

export interface BaseImageProps {
  apiEndpoint: string;
  maxFreeMessages?: number;
  additionalProps?: Record<string, unknown>;
  onImageGenerated?: (imageUrl: string) => void;
}

export interface Document {
  name: string;
  id: string;
  size?: number;
  uploadedAt?: Date;
}

export interface DocumentManagerProps {
  documents: Document[];
  onDocumentSelect: (document: Document | undefined) => void;
  selectedDocumentId?: string;
  onDocumentUpload: (file: File) => Promise<void>;
  onDocumentDelete: (documentId: string) => Promise<void>;
}

export interface ImageContentProps {
  initial: boolean;
  loading: boolean;
  error: string | null;
  imageUrl: string | null;
}

export interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ChatPayload {
  question: string;
  conversationHistory: Message[];
  [key: string]: unknown;
}
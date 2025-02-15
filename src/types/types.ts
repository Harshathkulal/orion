export interface TextContentProps {
  messages: Message[];
  answer: string;
  loading: boolean;
  initial: boolean;
  error: string | null;
}

export interface Message {
  role: 'user' | 'assistant';
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

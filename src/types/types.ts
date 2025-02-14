export interface TextContentProps {
  answer: string;
  loading: boolean;
  initial: boolean;
  error: string | null;
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

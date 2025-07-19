import React from "react";
import { Loader, AlertCircle } from "lucide-react";
import { ErrorMessageProps } from "@/types/types";

export const LoadingIndicator = () => (
  <div className="flex items-center gap-2 text-muted-foreground text-sm mt-4">
    <Loader className="animate-spin" size={16} />
    <span>Generating...</span>
  </div>
);

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="flex items-center gap-2 text-red-500 text-sm mt-4 bg-red-50 dark:bg-red-900/10 p-3 rounded-md">
    <AlertCircle size={16} />
    <span>{message}</span>
  </div>
);

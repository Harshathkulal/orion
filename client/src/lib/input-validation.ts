interface ConversationItem {
  role: "user" | "assistant";
  content: string;
}

interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export function validateInput(options: {
  question: string;
  conversationHistory: ConversationItem[];
  maxLength: number;
  allowedCharacters: RegExp;
}): ValidationResult {
  const errors: string[] = [];

  if (!options.question) {
    errors.push("Question is required");
  }

  if (options.question.length > options.maxLength) {
    errors.push(`Question exceeds max length of ${options.maxLength}`);
  }

  if (!options.allowedCharacters.test(options.question)) {
    errors.push("Question contains disallowed characters");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

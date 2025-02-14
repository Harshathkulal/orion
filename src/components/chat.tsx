"use client";

import React from "react";
import TextInput from "@/components/text-input";
import TextContent from "./text-content";
import LoginDialog from "./login-dialog";

interface ChatState {
  question: string;
  answer: string;
  loading: boolean;
  initial: boolean;
  messageCount: number;
  showLoginDialog: boolean;
  error: string | null;
}

type ChatStateUpdate =
  | Partial<ChatState>
  | ((prev: ChatState) => Partial<ChatState>);

const MAX_FREE_MESSAGES = 3;
const API_ENDPOINT = "/api/text";

const useStreamReader = () => {
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const cleanup = React.useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    getSignal: () => {
      cleanup();
      abortControllerRef.current = new AbortController();
      return abortControllerRef.current.signal;
    },
    cleanup,
  };
};

const useChatState = (initialState: Partial<ChatState> = {}) => {
  const [state, setState] = React.useState<ChatState>({
    question: "",
    answer: "",
    loading: false,
    initial: true,
    messageCount: 0,
    showLoginDialog: false,
    error: null,
    ...initialState,
  });

  const updateState = React.useCallback((update: ChatStateUpdate) => {
    setState((prev) => ({
      ...prev,
      ...(typeof update === "function" ? update(prev) : update),
    }));
  }, []);

  return [state, updateState] as const;
};

export default function ChatPage() {
  const [state, updateState] = useChatState();
  const streamReader = useStreamReader();

  const checkMessageLimit = React.useCallback(() => {
    if (state.messageCount >= MAX_FREE_MESSAGES) {
      updateState({ showLoginDialog: true });
      return false;
    }
    return true;
  }, [state.messageCount, updateState]);

  const processStream = React.useCallback(
    async (response: Response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("ReadableStream not supported in this browser");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          updateState((prev) => ({
            answer: prev.answer + chunk,
            error: null,
          }));
        }
      } catch (error) {
        reader.cancel();
        throw error;
      }
    },
    [updateState]
  );

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!checkMessageLimit()) return;

      const trimmedQuestion = state.question.trim();
      if (!trimmedQuestion) return;

      updateState({
        initial: false,
        loading: true,
        answer: "",
        error: null,
      });

      try {
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          signal: streamReader.getSignal(),
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: trimmedQuestion }),
        });

        await processStream(response);

        updateState((prev) => ({
          messageCount: prev.messageCount + 1,
          showLoginDialog: prev.messageCount + 1 >= MAX_FREE_MESSAGES,
        }));
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            console.log("Request was aborted");
            updateState({
              error: "Response generation was stopped.",
              answer: state.answer || "Response generation was stopped.",
            });
          } else {
            console.error("Error:", error);
            updateState({
              error: "Failed to get response. Please try again.",
              answer:
                state.answer || "Failed to get response. Please try again.",
            });
          }
        }
      } finally {
        updateState({
          loading: false,
          question: "",
        });
      }
    },
    [
      state.question,
      state.answer,
      checkMessageLimit,
      processStream,
      streamReader,
      updateState,
    ]
  );

  const handleStop = React.useCallback(() => {
    streamReader.cleanup();
    updateState({
      loading: false,
      error: "Response generation was stopped.",
    });
  }, [streamReader, updateState]);

  return (
    <div className="flex flex-col flex-1">
      <TextContent
        answer={state.answer}
        loading={state.loading}
        initial={state.initial}
        error={state.error}
      />
      <TextInput
        question={state.question}
        setQuestion={(question: string) => updateState({ question })}
        onSubmit={handleSubmit}
        loading={state.loading}
        handleStop={handleStop}
      />
      <LoginDialog
        open={state.showLoginDialog}
        onOpenChange={(showLoginDialog: boolean) =>
          updateState({ showLoginDialog })
        }
      />
    </div>
  );
}

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Message } from "@/types/types";
import { sendMessage, streamResponse } from "@/services/chatService";
import { useAuth } from "@/lib/auth/use-session";
import { getConversation } from "@/services/conversationService";
import { refreshSidebar } from "@/hooks/useConversation";

export function useChat(conversationId?: string | null) {
  const { isAuthenticated } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [fetchConversationLoading, setFetchConversationLoading] =
    useState(false);

  const [activeId, setActiveId] = useState<string | null>(
    conversationId || null,
  );

  // Sync activeId with prop when prop changes
  useEffect(() => {
    setActiveId(conversationId || null);
  }, [conversationId]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const hasLoadedRef = useRef(false);
  const isCreatingRef = useRef(false);

  // Load conversation when conversationId changes
  useEffect(() => {
    if (isCreatingRef.current) {
      isCreatingRef.current = false;
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const loadConversation = async () => {
      if (!activeId) {
        setMessages([]);
        setFetchConversationLoading(false);
        setError(null);
        hasLoadedRef.current = false;
        return;
      }

      setFetchConversationLoading(true);
      setMessages([]);
      hasLoadedRef.current = true;

      if (!isAuthenticated) {
        setFetchConversationLoading(false);
        return;
      }

      try {
        const conv = await getConversation(activeId);
        if (controller.signal.aborted) return;

        if (conv.messages) {
          setMessages(
            conv.messages.map((m) => ({
              id: m.id,
              role: m.role === "model" ? "model" : "user",
              content: m.content,
              fileName: m.fileName ?? undefined,
              isRag: m.isRag ?? false,
              isImage: m.isImage ?? false,
            })),
          );
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Conversation likely new or error:", err);
      } finally {
        if (!controller.signal.aborted) {
          setFetchConversationLoading(false);
        }
      }
    };

    loadConversation();

    return () => controller.abort();
  }, [activeId, isAuthenticated]);

  // Listen for NEW CHAT event
  useEffect(() => {
    const handleNewChatEvent = () => {
      setActiveId(null);
      setMessages([]);
      setLoading(false);
      setError(null);
      setQuestion("");
    };

    globalThis.addEventListener("nav-new-chat", handleNewChatEvent);
    return () =>
      globalThis.removeEventListener("nav-new-chat", handleNewChatEvent);
  }, []);

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setLoading(false);
  }, []);

  const handleSubmit = async (payload: {
    question: string;
    fileName?: string;
    isImage?: boolean;
    isRag?: boolean;
    collectionName?: string;
  }) => {
    const trimmed =
      payload.question.trim() ||
      (payload.isRag && payload.fileName ? `Analyze ${payload.fileName}` : "");
    if (!trimmed || loading) return;

    if (!isAuthenticated && messageCount >= 3) {
      setShowLoginDialog(true);
      return;
    }

    let currentConversationId = activeId;
    const isNewConversation = !currentConversationId;

    if (isNewConversation) {
      currentConversationId = crypto.randomUUID();
      isCreatingRef.current = true;
      setActiveId(currentConversationId);
    }

    if (!currentConversationId) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      fileName: payload.fileName,
      isRag: payload.isRag,
      isImage: payload.isImage,
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);
    setQuestion("");

    if (isNewConversation) {
      globalThis.history.replaceState(
        null,
        "",
        `/chat/${currentConversationId}`,
      );

      let type = "text";
      if (payload.isImage) type = "image";
      else if (payload.isRag) type = "rag";

      refreshSidebar({
        id: currentConversationId,
        title: trimmed.substring(0, 50) || "New Chat",
        type,
        documentId: null,
        updatedAt: new Date(),
      });
    }

    try {
      const response = await sendMessage({
        question: trimmed,
        conversationHistory: messages,
        conversationId: currentConversationId,
        fileName: payload.fileName,
        isImage: payload.isImage ?? false,
        isRag: payload.isRag ?? false,
        collectionName: payload.collectionName ?? null,
      });

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "model", content: "" },
      ]);

      const finalContent = await streamResponse(response, (text) => {
        setMessages((prev) => {
          const next = [...prev];
          const last = next.at(-1);
          if (last?.role === "model") last.content = text;
          return next;
        });
      });

      setMessages((prev) => {
        const next = [...prev];
        const last = next.at(-1);
        if (last?.role === "model") last.content = finalContent;
        return next;
      });

      if (!isAuthenticated) setMessageCount((c) => c + 1);

      refreshSidebar();
    } catch (err) {
      console.error("Chat error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetChat = useCallback(() => {
    setMessages([]);
    setLoading(false);
    setError(null);
    hasLoadedRef.current = false;
  }, []);

  return {
    messages,
    question,
    setQuestion,
    loading,
    error,
    showLoginDialog,
    setShowLoginDialog,
    handleSubmit,
    handleStop,
    resetChat,
    fetchConversationLoading,
  };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getConversations,
  type Conversation,
} from "@/services/conversationService";

// Custom event name for sidebar refresh
export const SIDEBAR_REFRESH_EVENT = "sidebar-refresh";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationLoading, setConversationLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      setError("Failed to load conversations");
    } finally {
      setConversationLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();

    // Listen for refresh events
    const handleRefresh = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        // Optimistic update: add new conversation to top
        updateConversationsOptimistic(customEvent.detail);
      } else {
        // Standard refresh (fetch from API)
        fetchConversations();
      }
    };
    globalThis.addEventListener(SIDEBAR_REFRESH_EVENT, handleRefresh);

    return () => {
      globalThis.removeEventListener(SIDEBAR_REFRESH_EVENT, handleRefresh);
    };
  }, [fetchConversations]);

  const updateConversationsOptimistic = (newConversation: Conversation) => {
    setConversations((prev) => {
      // Prevent duplicates just in case
      if (prev.some((c) => c.id === newConversation.id)) return prev;
      return [newConversation, ...prev];
    });
  };

  return {
    conversations,
    conversationLoading,
    error,
    refetch: fetchConversations,
  };
}

// Helper to trigger sidebar refresh from anywhere
export function refreshSidebar(newConversation?: Conversation) {
  if (newConversation) {
    globalThis.dispatchEvent(
      new CustomEvent(SIDEBAR_REFRESH_EVENT, { detail: newConversation })
    );
  } else {
    globalThis.dispatchEvent(new Event(SIDEBAR_REFRESH_EVENT));
  }
}

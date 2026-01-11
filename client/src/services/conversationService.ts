import api from "@/lib/axios";

export interface Conversation {
  id: string;
  title: string;
  type: string;
  documentId: string | null;
  updatedAt: Date;
  messages?: Message[];
}

export interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  createdAt: Date;
  fileName?: string;
  isRag?: boolean;
  isImage?: boolean;
}

export async function createConversation(
  title?: string,
  type: string = "text",
  documentId?: string
): Promise<Conversation> {
  const response = await api.post(`/conversations`, {
    title,
    type,
    documentId,
  });
  return response.data;
}

export async function getConversations(): Promise<Conversation[]> {
  const response = await api.get(`/conversations`);
  return response.data;
}

export async function getConversation(
  conversationId: string
): Promise<Conversation> {
  const response = await api.get(`/conversations/${conversationId}`);
  return response.data;
}

export async function deleteConversation(
  conversationId: string
): Promise<void> {
  await api.delete(`/conversations/${conversationId}`);
}


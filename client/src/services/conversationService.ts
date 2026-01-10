import api from "@/lib/axios";
const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL!;

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
}

export async function createConversation(
  title?: string,
  type: string = "text",
  documentId?: string
): Promise<Conversation> {
  const response = await api.post(`${BASE_URL}/conversations`, {
    title,
    type,
    documentId,
  });
  return response.data;
}

export async function getConversations(): Promise<Conversation[]> {
  const response = await api.get(`${BASE_URL}/conversations`);
  return response.data;
}

export async function getConversation(
  conversationId: string
): Promise<Conversation> {
  const response = await api.get(`${BASE_URL}/conversations/${conversationId}`);
  return response.data;
}

export async function deleteConversation(
  conversationId: string
): Promise<void> {
  await api.delete(`${BASE_URL}/conversations/${conversationId}`);
}


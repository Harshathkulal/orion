import api from "@/lib/axios";

export interface AccountResponse {
  profile: {
    email: string;
    joinedAt: string;
    emailVerified: boolean;
  };
  usage: {
    conversations: string;
    documents: string;
    chunks: string;
    images: string;
  };
  lastActive: string;
}

export async function getAccountStats(): Promise<AccountResponse> {
  try {
    const res = await api.get<AccountResponse>("/account");
    return res.data;
  } catch {
    throw new Error("Failed to fetch account stats");
  }
}

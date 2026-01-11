import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { conversations, messages } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

type Params = {
  conversationId: string;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    // Auth
    const authData = await auth.api.getSession({ headers: req.headers });
    const userId = authData?.session?.userId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;

    // Fetch conversation
    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
    });

    if (!conversation || conversation?.userId !== userId) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Fetch messages
    const conversationMessages = await db.query.messages.findMany({
      where: eq(messages.conversationId, conversationId),
      orderBy: [messages.createdAt],
    });

    return NextResponse.json({
      ...conversation,
      messages: conversationMessages.map((m) => ({
        id: m.id,
        role: m.role === "assistant" ? "model" : m.role,
        content: m.content,
        fileName: m.fileName ?? null,
        isRag: Boolean(m.isRag),
        isImage: Boolean(m.isImage),
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /conversations/:id error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

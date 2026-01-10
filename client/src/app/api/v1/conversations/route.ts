import { eq, desc } from "drizzle-orm";
import { db } from "@/db/db";
import { conversations } from "@/db/schema";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const authData = await auth.api.getSession({ headers: req.headers });
    const userId = authData?.session?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch conversations sorted by updatedAt DESC
    const userConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));

    // Minimal info for sidebar
    const sidebarData = userConversations.map((conv) => ({
      id: conv.id,
      title: conv.title,
      type: conv.type,
      updatedAt: conv.updatedAt,
    }));

    return NextResponse.json(sidebarData);
  } catch (err) {
    console.error("Failed to fetch conversations for sidebar", err);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

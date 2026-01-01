import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { ragChats } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const chats = await db
      .select({
        id: ragChats.id,
        title: ragChats.question,
        updatedAt: ragChats.createdAt,
      })
      .from(ragChats)
      .where(eq(ragChats.userId, session.user.id))
      .orderBy(desc(ragChats.createdAt))
      .limit(50);

    return NextResponse.json(chats, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("GET /chats error", error);
    return NextResponse.json(
      { message: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

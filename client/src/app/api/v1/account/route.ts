import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { user, conversations, documents, images, session } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  // Auth
  const authData = await auth.api.getSession({ headers: req.headers });
  const userId = authData?.session?.userId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [convoCount, documentStats, imageCount, lastActive, userData] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(conversations)
        .where(eq(conversations.userId, userId)),

      db
        .select({
          docs: sql<number>`count(*)`,
          chunks: sql<number>`coalesce(sum(${documents.chunkCount}), 0)`,
        })
        .from(documents)
        .where(eq(documents.userId, userId)),

      db
        .select({ count: sql<number>`count(*)` })
        .from(images)
        .where(eq(images.userId, userId)),

      db
        .select({
          lastActive: sql<Date | null>`max(updated_at)`,
        })
        .from(session)
        .where(eq(session.userId, userId)),

      db
        .select({
          email: user.email,
          joinedAt: user.createdAt,
          emailVerified: user.emailVerified,
        })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1),
    ]);

  return NextResponse.json({
    profile: userData[0],
    usage: {
      conversations: convoCount[0].count,
      documents: documentStats[0].docs,
      chunks: documentStats[0].chunks,
      images: imageCount[0].count,
    },
    lastActive: lastActive[0]?.lastActive ?? null,
  });
}

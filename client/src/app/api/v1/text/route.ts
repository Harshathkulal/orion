import { db } from "@/db/db";
import { conversations, messages } from "@/db/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { applyApiProtection } from "@/lib/middleware/api-protection";
import { validateInput } from "@/lib/input-validation";
import { logger } from "@/lib/logger";
import { ConversationItem, UiMessage } from "@/types/types";
import { eq } from "drizzle-orm";
import cuid from "cuid";

/* ======================================================
   ROUTE
====================================================== */

export async function POST(req: NextRequest) {
  try {
    const protection = await applyApiProtection(req);
    if (protection) return protection;

    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.session?.userId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      question,
      conversationHistory = [],
      conversationId,
      isImage,
      isRag,
      collectionName,
      fileName,
    } = body;

    const normalizedHistory = normalizeHistory(conversationHistory);

    const validation = validateInput({
      question,
      conversationHistory: normalizedHistory,
      maxLength: 1000,
      allowedCharacters: /^[a-zA-Z0-9\s.,!?()-]+$/,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { message: "Invalid input", errors: validation.errors },
        { status: 400 },
      );
    }

    let chatType: "text" | "rag" | "image" = "text";
    if (isImage) {
      chatType = "image";
    } else if (isRag) {
      chatType = "rag";
    }

    const currentConversationId = await upsertConversation({
      conversationId,
      userId,
      title: question.slice(0, 50) || "New Chat",
      type: chatType,
      documentId: chatType === "rag" ? collectionName : null,
    });

    await db.insert(messages).values({
      id: cuid(),
      conversationId: currentConversationId,
      role: "user",
      content: question,
      isRag: chatType === "rag",
      isImage: false,
      fileName: chatType === "rag" ? fileName : null,
      createdAt: new Date(),
    });

    /* ================= IMAGE ================= */

    if (chatType === "image") {
      const seed = Math.floor(Math.random() * 1_000_000);
      const url = `${process.env.IMAGE_GENERATION_API_URL}${encodeURIComponent(
        question,
      )}?seed=${seed}&width=512&height=512`;

      await db.insert(messages).values({
        id: cuid(),
        conversationId: currentConversationId,
        role: "assistant",
        content: url,
        isImage: true,
        isRag: false,
        fileName: null,
        createdAt: new Date(),
      });

      return NextResponse.json(
        { url },
        { headers: { "X-Conversation-Id": currentConversationId } },
      );
    }

    /* ================= RAG ================= */

    let context = "";

    if (chatType === "rag") {
      try {
        const embedder = new GoogleGenerativeAIEmbeddings({
          model: "text-embedding-004",
          apiKey: process.env.GEMINI_API_KEY!,
        });

        const store = new QdrantVectorStore(embedder, {
          url: process.env.QDRANT_URL!,
          apiKey: process.env.QDRANT_API_KEY!,
          collectionName,
        });

        const results = await store.similaritySearch(question, 5);
        context = results.map((r) => r.pageContent).join("\n\n");
      } catch (err) {
        logger.error(
          "RAG context retrieval error",
          err as Record<string, unknown>,
        );
        return NextResponse.json(
          { error: "Failed to retrieve document context" },
          { status: 500 },
        );
      }
    }

    /* ================= STREAM ================= */

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt =
      chatType === "rag" && context
        ? `Use ONLY this context:\n${context}\n\nQuestion:\n${question}`
        : question;

    let responseText = "";

    // API connection BEFORE creating the stream
    let chat;
    try {
      chat = model.startChat({
        history: normalizedHistory.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      });

      // Try to initiate the stream to catch quota/API errors early
      const testResult = await chat.sendMessageStream(prompt);

      // Create the actual stream only if the connection works
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of testResult.stream) {
              const text = chunk.text();
              if (!text) continue;
              responseText += text;
              controller.enqueue(new TextEncoder().encode(text));
            }

            // Save the complete response to the database
            await db.insert(messages).values({
              id: cuid(),
              conversationId: currentConversationId,
              role: "assistant",
              content: responseText,
              isRag: chatType === "rag",
              isImage: false,
              fileName: chatType === "rag" ? fileName : null,
              createdAt: new Date(),
            });

            controller.close();
          } catch (err) {
            logger.error(
              "Stream processing error",
              err as Record<string, unknown>,
            );
            controller.error(err);
          }
        },
      });

      const headers: HeadersInit = {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-store",
        Connection: "keep-alive",
        "X-Conversation-Id": currentConversationId,
      };

      return new NextResponse(stream, { headers });
    } catch (err) {
      logger.error("Gemini API Error", err as Record<string, unknown>);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  } catch (err) {
    logger.error("Chat API Error", err as Record<string, unknown>);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ======================================================
   HELPERS
====================================================== */

function normalizeHistory(history: UiMessage[]): ConversationItem[] {
  return history.map((m) => ({
    role: m.role === "model" ? "assistant" : "user",
    content: m.content,
  }));
}

async function upsertConversation({
  conversationId,
  userId,
  title,
  type,
  documentId,
}: {
  conversationId?: string | null;
  userId: string;
  title: string;
  type: "text" | "rag" | "image";
  documentId?: string | null;
}): Promise<string> {
  if (conversationId) {
    const existing = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
    });

    if (existing) {
      await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, conversationId));

      return conversationId;
    }
  }

  const id = conversationId ?? cuid();

  await db.insert(conversations).values({
    id,
    userId,
    title,
    type,
    documentId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return id;
}

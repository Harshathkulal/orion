import { db } from "@/db/db";
import { conversations, messages } from "@/db/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import cuid from "cuid";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { applyApiProtection } from "@/lib/middleware/api-protection";
import { validateInput } from "@/lib/input-validation";
import { logger } from "@/lib/logger";
import { Message } from "@/types/types";
import { eq } from "drizzle-orm";

/**
 * Handles POST requests for chat (text | rag | image).
 * Validates input, performs optional vector search, and streams responses.
 */
export async function POST(req: NextRequest) {
  try {
    // API protection
    const protectionResponse = await applyApiProtection(req);
    if (protectionResponse) return protectionResponse;

    // Auth
    const authData = await auth.api.getSession({ headers: req.headers });
    const userId = authData?.session?.userId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse input
    const body = await req.json();
    const {
      question,
      conversationHistory = [],
      conversationId,
      isImage = false,
      isRag = false,
      collectionName,
    } = body;

    // Validate input
    const validationResult = validateInput({
      question,
      conversationHistory,
      maxLength: 1000,
      allowedCharacters: /^[a-zA-Z0-9\s.,!?()-]+$/,
    });

    if (!validationResult.valid) {
      return NextResponse.json(
        { message: "Invalid input", details: validationResult.errors },
        { status: 400 }
      );
    }

    // Resolve chat type
    let chatType: "text" | "rag" | "image";

    if (isImage) {
      chatType = "image";
    } else if (isRag) {
      chatType = "rag";
    } else {
      chatType = "text";
    }

    /* ======================================================
       CONVERSATION
    ====================================================== */

    let currentConversationId = conversationId ?? null;

    // Check if conversation exists (must belong to user)
    const existingConversation = currentConversationId
      ? await db.query.conversations.findFirst({
          where: eq(conversations.id, currentConversationId),
        })
      : null;

    // If conversation exists → update timestamp
    if (existingConversation) {
      // If exists → update timestamp
      await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, currentConversationId));
    } else {
      // If conversation DOES NOT exist → create it
      currentConversationId = currentConversationId ?? cuid(); // fallback only if client didn't send one

      await db.insert(conversations).values({
        id: currentConversationId,
        userId,
        title: question.slice(0, 50) || "New Chat",
        type: chatType,
        documentId: chatType === "rag" ? collectionName : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    /* ======================================================
       SAVE USER MESSAGE (SAFE NOW)
    ====================================================== */

    await db.insert(messages).values({
      id: cuid(),
      conversationId: currentConversationId,
      role: "user",
      content: question,
      createdAt: new Date(),
    });

    /* ======================================================
       IMAGE MODE
    ====================================================== */

    if (chatType === "image") {
      const seed = Math.floor(Math.random() * 1_000_000);
      const imageUrl = `${process.env.IMAGE_GENERATION_API_URL}${encodeURIComponent(
        question
      )}?seed=${seed}&width=512&height=512`;

      await db.insert(messages).values({
        id: cuid(),
        conversationId: currentConversationId,
        role: "assistant",
        content: imageUrl,
        createdAt: new Date(),
      });

      return NextResponse.json(
        { url: imageUrl },
        { headers: { "X-Conversation-Id": currentConversationId } }
      );
    }

    /* ======================================================
       OPTIONAL RAG
    ====================================================== */

    let context = "";

    if (chatType === "rag") {
      const embedder = new GoogleGenerativeAIEmbeddings({
        model: "text-embedding-004",
        apiKey: process.env.GEMINI_API_KEY!,
      });

      const vectorStore = new QdrantVectorStore(embedder, {
        url: process.env.QDRANT_URL!,
        apiKey: process.env.QDRANT_API_KEY!,
        collectionName,
      });

      const results = await vectorStore.similaritySearch(question, 5);
      context = results.map((r) => r.pageContent).join("\n\n");
    }

    /* ======================================================
       MODEL
    ====================================================== */

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt =
      chatType === "rag" && context
        ? `Use ONLY this context:\n${context}\n\nQuestion:\n${question}`
        : question;

    // Convert history to Google AI format (ensure first message is from user)
    let history = conversationHistory.slice(-4).map((m: Message) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Ensure first message is from user (Google AI requirement)
    while (history.length > 0 && history[0].role !== "user") {
      history = history.slice(1);
    }

    let responseText = "";

    const stream = new ReadableStream({
      async start(controller) {
        const chat = model.startChat({ history });
        const result = await chat.sendMessageStream(prompt);

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (!text) continue;

          responseText += text;
          controller.enqueue(new TextEncoder().encode(text));
        }

        await db.insert(messages).values({
          id: cuid(),
          conversationId: currentConversationId!,
          role: "assistant",
          content: responseText,
          createdAt: new Date(),
        });

        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-store",
        Connection: "keep-alive",
        "X-Conversation-Id": currentConversationId,
      },
    });
  } catch (error) {
    logger.error("Global API Error", error as Record<string, unknown>);
    return NextResponse.json({ message: "Server failed" }, { status: 500 });
  }
}

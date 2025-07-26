import { db } from "@/db/db";
import { ragChats } from "@/db/schema";
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

/**
 * Handles POST requests for RAG (Retrieval-Augmented Generation).
 * Validates input, performs vector search, and streams responses from Google LLM.
 *
 * @param req - The incoming Next.js request object
 * @returns A stream of text responses or an error message
 */
export async function POST(req: NextRequest) {
  try {
    // API protection: IP block + rate limit
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
    const { question, collectionName, conversationHistory } = body;

    // Validate input
    const validationResult = validateInput({
      question,
      conversationHistory,
      maxLength: 1000,
      allowedCharacters: /^[a-zA-Z0-9\s.,!?()-]+$/,
    });

    if (!validationResult.valid) {
      return NextResponse.json(
        {
          message: "Invalid input",
          details: validationResult.errors,
        },
        { status: 400 }
      );
    }

    if (!collectionName) {
      return NextResponse.json(
        { error: "Missing document or collection" },
        { status: 400 }
      );
    }

    // Check API key
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const vectorDBkey = process.env.QDRANT_API_KEY!;
    const vectorUrl = process.env.QDRANT_URL!;

    if (!geminiApiKey || !vectorDBkey || !vectorUrl) {
      logger.error("Missing API keys");
      return new NextResponse(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500 }
      );
    }

    // Initialize embeddings
    const embedder = new GoogleGenerativeAIEmbeddings({
      model: "text-embedding-004",
      apiKey: geminiApiKey,
    });

    // Initialize Qdrant vector store
    const vectorStore = new QdrantVectorStore(embedder, {
      url: vectorUrl,
      apiKey: vectorDBkey,
      collectionName,
    });

    // Initialize Google model
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // Perform vector search
    const searchResults = await vectorStore.similaritySearch(question, 5);
    const context = searchResults.map((doc) => doc.pageContent).join("\n\n");

    // Prepare conversation context (limited to last 4 messages)
    const limitedHistory = (conversationHistory || [])
      .slice(-4)
      .map((msg: Message) => ({
        role: msg.role,
        parts: [{ text: msg.content.slice(0, 500) }],
      }));

    const fullConversation = [
      ...limitedHistory,
      {
        role: "user",
        parts: [
          {
            text: `You are an expert assistant. Use ONLY the following context to answer the question below. Do NOT make assumptions beyond the given information,Context:\n\n${context}\n\nQuestion: ${question}`,
          },
        ],
      },
    ];

    let responseText = "";

    // Abort controller for streaming
    const abortController = new AbortController();
    const signal = abortController.signal;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const chat = model.startChat({ history: fullConversation });
          const result = await chat.sendMessageStream(question);

          if (signal.aborted) {
            controller.close();
            return;
          }

          if (!result || !result.stream) {
            throw new Error("Invalid response from model");
          }

          for await (const chunk of result.stream) {
            if (signal.aborted) break;

            if (!chunk || !chunk.text) continue;

            const text = chunk.text();
            responseText += text;

            try {
              const encoder = new TextEncoder();
              const encodedText = encoder.encode(text);
              controller.enqueue(encodedText);
            } catch (error) {
              console.error("Enqueue failed:", error);
              break;
            }
          }

          // Save prompt and response if not aborted
          if (!signal.aborted) {
            try {
              await db.insert(ragChats).values({
                id: cuid(),
                userId: userId,
                question: question,
                response: responseText,
                collectionName,
                createdAt: new Date(),
              });
            } catch (err) {
              console.error("failed to save Rag in DB", err);
            }
            controller.close();
          }
        } catch (error) {
          console.error("AI error:", error);

          try {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error occurred";
            const encoder = new TextEncoder();
            controller.enqueue(
              encoder.encode(JSON.stringify({ error: errorMessage }))
            );
          } catch (e) {
            console.error("Failed to send error message:", e);
          }

          if (!signal.aborted) {
            controller.close();
          }
        }
      },
      cancel() {
        console.log("Chat stream aborted");
        abortController.abort();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "no-referrer",
        Connection: "keep-alive",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (globalError) {
    logger.error("Global API Error", globalError as Record<string, unknown>);
    return new NextResponse(JSON.stringify({ message: "Server failed" }), {
      status: 500,
    });
  }
}

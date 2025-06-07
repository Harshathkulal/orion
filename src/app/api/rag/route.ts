// app/api/chat/route.ts

import { db } from "@/db/db";
import { ragChats } from "@/db/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import cuid from "cuid";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { rateLimit } from "@/lib/rate-limit";
import { ipFilter } from "@/lib/ip-filter";
import { validateInput } from "@/lib/input-validation";
import { logger } from "@/lib/logger";
import { createHash } from "crypto";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const embedder = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: process.env.GEMINI_API_KEY2!,
});

export async function POST(req: NextRequest) {
  try {
    // IP-based Protection and Filtering
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // Block potentially malicious IPs
    if (ipFilter.isBlocked(clientIp)) {
      return new NextResponse(JSON.stringify({ message: "Access denied" }), {
        status: 403,
      });
    }

    // Rate Limiting
    const identifier = createHash("sha256").update(clientIp).digest("hex");

    try {
      await rateLimit.check(identifier, 10, 60000); // 10 requests per minute
    } catch (error) {
      logger.error("Rate limit exceeded", error as Record<string, unknown>);
      return new NextResponse(
        JSON.stringify({ message: "Too many requests" }),
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { query, collectionName } = body;

    // Input Validation
    const validationResult = validateInput({
      question: query,
      conversationHistory: [],
      maxLength: 1000,
      allowedCharacters: /^[a-zA-Z0-9\s.,!?()-]+$/,
    });

    if (!validationResult.valid) {
      return NextResponse.json({
        message: "Invalid input",
        details: validationResult.errors,
      }, { status: 400 });
    }

    if (!query || !collectionName) {
      return NextResponse.json(
        { error: "Please upload a PDF and select a document." },
        { status: 400 }
      );
    }

    const vectorStore = new QdrantVectorStore(embedder, {
      url: process.env.QDRANT_URL!,
      apiKey: process.env.QDRANT_API_KEY!,
      collectionName,
    });

    const searchResults = await vectorStore.similaritySearch(query, 5);
    interface SearchResult {
      pageContent: string;
      metadata: Record<string, unknown>;
    }

    const context: string = searchResults.map((doc: SearchResult) => doc.pageContent).join("\n\n");

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Use the following context to answer the question:\n\n${context}\n\nQuestion: ${query}`,
            },
          ],
        },
      ],
    });

    const textResponse = result.response.text();

    await db.insert(ragChats).values({
      id: cuid(),
      userId: userId || null,
      Query: query,
      Response: textResponse,
      collectionName,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      message: "Chat successful",
      response: textResponse,
    }, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (err) {
    logger.error("RAG Chat error:", err as Record<string, unknown>);
    return NextResponse.json({ error: "Chat failed", details: String(err) }, { status: 500 });
  }
}

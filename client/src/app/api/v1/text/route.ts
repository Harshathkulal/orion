import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { Message } from "@/types/types";
import { validateInput } from "@/lib/input-validation";
import { logger } from "@/lib/logger";
import { db } from "@/db/db";
import { prompts } from "@/db/schema";
import cuid from "cuid";
import { applyApiProtection } from "@/lib/middleware/api-protection";
import { findDocuments } from "@/lib/find-documents";

/**
 * Handles POST requests to the chat interactions.
 * Validates input, checks API key, and streams responses from Google LLM.
 *
 * @param req - The incoming Next.js request object
 * @returns A stream of text responses or an error message
 */
export async function POST(req: NextRequest) {
  try {
    // API protection: IP block + rate limit
    const protectionResponse = await applyApiProtection(req);
    if (protectionResponse) return protectionResponse;

    // Parse input
    const { question, conversationHistory = [], fileName } = await req.json();

    // Validate input
    const validationResult = validateInput({
      question,
      conversationHistory,
      maxLength: 1000,
      allowedCharacters: /^[a-zA-Z0-9\s.,!?()-]+$/,
    });

    if (!validationResult.valid) {
      return new NextResponse(
        JSON.stringify({
          message: "Invalid input",
          details: validationResult.errors,
        }),
        { status: 400 }
      );
    }

    // Check API key
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      logger.error("Missing Gemini API key");
      return new NextResponse(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500 }
      );
    }

    // Fetch Qdrant context if file is provided
    let qdrantContext = "";
    if (fileName) {
      try {
        qdrantContext = await findDocuments(question, fileName);
      } catch (err) {
        console.error("Qdrant search failed:", err);
      }
    }

    // Build conversation history (last 4 messages only)
    const limitedHistory = conversationHistory
      .slice(-4)
      .map((msg: Message) => ({
        role: msg.role,
        parts: [{ text: msg.content.slice(0, 500) }],
      }));

    // Inline Qdrant context directly into the user's prompt
    const finalPrompt =
      fileName && qdrantContext
        ? `Use the following document context to answer:\n\n${qdrantContext}\n\nUser Question: ${question}`
        : question;

    const fullConversation = [
      ...limitedHistory,
      { role: "user", parts: [{ text: finalPrompt }] },
    ];

    // Create chat with context
    const genAI = new GoogleGenAI({ apiKey: geminiApiKey });
    const chat = genAI.chats.create({
      model: "gemini-2.5-flash",
      history: fullConversation,
    });

    let responseText = "";
    const abortController = new AbortController();
    const signal = abortController.signal;

    // Stream response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const responseStream = await chat.sendMessageStream({
            message: question,
          });

          for await (const chunk of responseStream) {
            if (signal.aborted) break;

            const text = chunk.text;
            responseText += text;

            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode(text));
          }

          if (!signal.aborted) {
            // Save to DB
            await db.insert(prompts).values({
              id: cuid(),
              prompt: question,
              response: responseText,
              createdAt: new Date(),
              fileName: fileName ?? null,
            });
            controller.close();
          }
        } catch (error) {
          console.error("AI error:", error);
          controller.enqueue(
            new TextEncoder().encode("Failed to get response. Try again.\n\n")
          );
          controller.close();
        }
      },
      cancel() {
        abortController.abort();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-store",
        Connection: "keep-alive",
      },
    });
  } catch (globalError) {
    logger.error("Global API Error", globalError as Record<string, unknown>);
    return new NextResponse(JSON.stringify({ message: "Server failed" }), {
      status: 500,
    });
  }
}

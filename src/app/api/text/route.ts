import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "@/types/types";
import { rateLimit } from "@/lib/rate-limit";
import { ipFilter } from "@/lib/ip-filter";
import { validateInput } from "@/lib/input-validation";
import { logger } from "@/lib/logger";
import { createHash } from "crypto";

export async function POST(req: NextRequest) {
  try {
    // IP-based Protection and Filtering
    const clientIp =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

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

    // Input Validation and Sanitization
    const { question, conversationHistory } = await req.json();

    const validationResult = validateInput({
      question,
      conversationHistory,
      maxLength: 1000, // Prevent oversized payloads
      allowedCharacters: /^[a-zA-Z0-9\s.,!?()-]+$/, // Basic sanitization
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

    // Environment and API Key Validation
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.error("Missing Gemini API key");
      return new NextResponse(
        JSON.stringify({ message: "Server configuration error" }),
        { status: 500 }
      );
    }

    // Initialize Google AI with Secure Configuration
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // Prepare Conversation Context with Limit
    const limitedHistory = conversationHistory
      .slice(-5) // Limit conversation history
      .map((msg: Message) => ({
        role: msg.role,
        parts: [{ text: msg.content.slice(0, 500) }], // Truncate individual message length
      }));

    const fullConversation = [
      ...limitedHistory,
      { role: "user", parts: [{ text: question }] },
    ];

    // Streaming Response with Timeout
    const stream = new ReadableStream({
      async start(controller) {
        const timeoutId = setTimeout(() => {
          controller.error(new Error("Request timed out"));
        }, 30000); // 30-second timeout

        try {
          const chat = model.startChat({ history: fullConversation });
          const result = await chat.sendMessageStream(question);

          for await (const chunk of result.stream) {
            controller.enqueue(chunk.text());
          }

          clearTimeout(timeoutId);
          controller.close();
        } catch (error) {
          clearTimeout(timeoutId);
          logger.error("AI Generation Error", error as Record<string, unknown>);
          controller.error(error);
        }
      },
    });

    // Enhanced Response Headers for Security
    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "no-referrer",
        Connection: "keep-alive",
      },
    });
  } catch (globalError) {
    logger.error("Global API Error", globalError as Record<string, unknown>);
    return new NextResponse(
      JSON.stringify({ message: "Unexpected server error" }),
      { status: 500 }
    );
  }
}

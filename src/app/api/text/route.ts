import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "@/types/types";
import { rateLimit } from "@/lib/rate-limit";
import { ipFilter } from "@/lib/ip-filter";
import { validateInput } from "@/lib/input-validation";
import { logger } from "@/lib/logger";
import { createHash } from "crypto";
import { db } from "@/lib/prisma";

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

    // Environment and API Key Validation
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.error("Missing Gemini API key");
      return new NextResponse(
        JSON.stringify({ message: "Server configuration error" }),
        { status: 500 }
      );
    }

    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // Prepare Conversation Context
    const limitedHistory = conversationHistory
      .slice(-4)
      .map((msg: Message) => ({
        role: msg.role,
        parts: [{ text: msg.content.slice(0, 500) }],
      }));

    const fullConversation = [
      ...limitedHistory,
      { role: "user", parts: [{ text: question }] },
    ];

    let responseText = "";

    // Use a shared abort signal
    const abortController = new AbortController();
    const signal = abortController.signal;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const chat = model.startChat({ history: fullConversation });
          const result = await chat.sendMessageStream(question);

          // Check if already aborted
          if (signal.aborted) {
            controller.close();
            return;
          }

          for await (const chunk of result.stream) {
            // Check if aborted before processing each chunk
            if (signal.aborted) {
              break;
            }

            const text = chunk.text();
            responseText += text;

            try {
              controller.enqueue(text);
            } catch (error) {
              // If enqueue fails, just break the loop
              console.log("Enqueue failed, likely due to closed stream", error);
              break;
            }
          }

          // Only save to DB and close controller if not aborted
          if (!signal.aborted) {
            // Save response
            db.prompt
              .create({
                data: {
                  prompt: question,
                  response: responseText,
                },
              })
              .catch((err) => {
                console.error("DB save error:", err);
              });

            // Close controller
            controller.close();
          }
        } catch (error) {
          console.error("AI error:", error);

          // If not already aborted, close the controller
          if (!signal.aborted) {
            controller.close();
          }
        }
      },

      cancel() {
        console.log("Stream was stopped by client");
        abortController.abort();
      },
    });

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

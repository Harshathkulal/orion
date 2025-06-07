import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { images } from "@/db/schema";
import cuid from "cuid";
import { rateLimit } from "@/lib/rate-limit";
import { ipFilter } from "@/lib/ip-filter";
import { validateInput } from "@/lib/input-validation";
import { logger } from "@/lib/logger";
import { createHash } from "crypto";

export async function POST(request: NextRequest) {
  try {
    // IP-based Protection and Filtering
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

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

    const { prompt }: { prompt: string } = await request.json();

    // Input Validation
    const validationResult = validateInput({
      question: prompt,
      conversationHistory: [],
      maxLength: 500,
      allowedCharacters: /^[a-zA-Z0-9\s.,!?()-]+$/,
    });

    if (!validationResult.valid) {
      return NextResponse.json({
        message: "Invalid input",
        details: validationResult.errors,
      }, { status: 400 });
    }

    function generateRandomNumber(): number {
      return Math.floor(Math.random() * 100000000) + 1;
    }

    const randomSeed = generateRandomNumber();
    const imageURL = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      prompt
    )}?seed=${randomSeed}&width=512&height=512&nologo=True`;

    // Verify the image URL is accessible
    const imageResponse = await fetch(imageURL);
    if (!imageResponse.ok) {
      throw new Error("Failed to generate image");
    }

    try {
      await db.insert(images).values({
        id: cuid(),
        prompt,
        url: imageURL,
        seed: randomSeed,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (err) {
      logger.error("Failed to save image to DB:", err as Record<string, unknown>);
      // Continue execution even if DB save fails
    }

    return NextResponse.json({ url: imageURL }, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (err) {
    logger.error("Image generation error:", err as Record<string, unknown>);
    return NextResponse.json({ error: "Image generation failed", details: String(err) }, { status: 500 });
  }
}

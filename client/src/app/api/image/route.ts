import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { images } from "@/db/schema";
import cuid from "cuid";
import { validateInput } from "@/lib/input-validation";
import { logger } from "@/lib/logger";
import { applyApiProtection } from "@/lib/middleware/api-protection";

/**
 * Handles POST requests to generate an image based on a prompt.
 * Validates input, generates image URL, and saves to database.
 *
 * @param request - The incoming Next.js request object
 * @returns JSON response with image URL or error message
 */
export async function POST(req: NextRequest) {
  try {
    // API protection: IP block + rate limit
    const protectionResponse = await applyApiProtection(req);
    if (protectionResponse) return protectionResponse;

    // Parse input
    const { prompt } = await req.json();

    // Input Validation
    const validationResult = validateInput({
      question: prompt,
      conversationHistory: [],
      maxLength: 500,
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

    function generateRandomNumber(): number {
      return Math.floor(Math.random() * 100000000) + 1;
    }

    // Generate image URL
    const randomSeed = generateRandomNumber();
    const imageURL = `${
      process.env.IMAGE_GENERATION_API_URL
    }${encodeURIComponent(
      prompt
    )}?seed=${randomSeed}&width=512&height=512&nologo=True`;

    // Verify image URL accessible
    const imageResponse = await fetch(imageURL);
    if (!imageResponse.ok) {
      throw new Error("Failed to generate image");
    }

    // Save image metadata to database
    try {
      await db.insert(images).values({
        id: cuid(),
        prompt,
        url: imageURL,
        seed: randomSeed,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error("failed to save Image in DB", err);
    }

    return NextResponse.json(
      { url: imageURL },
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "Referrer-Policy": "no-referrer",
        },
      }
    );
  } catch (err) {
    logger.error("Image generation error:", err as Record<string, unknown>);
    return NextResponse.json(
      { error: "Image generation failed", details: String(err) },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { images } from "@/db/schema";
import cuid from "cuid";

export async function POST(request: NextRequest) {
  const { prompt }: { prompt: string } = await request.json();

  function generateRandomNumber(): number {
    return Math.floor(Math.random() * 100000000) + 1;
  }

  const randomSeed = generateRandomNumber();
  const imageURL = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    prompt
  )}?seed=${randomSeed}&width=512&height=512&nologo=True`;

  await fetch(imageURL);

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
    console.error("Failed to save image to DB:", err);
  }

  return NextResponse.json({ url: imageURL });
}

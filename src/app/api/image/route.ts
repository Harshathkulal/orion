import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

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

  db.image
    .create({
      data: {
        prompt,
        url: imageURL,
        seed: randomSeed,
        // userId: ""
      },
    })
    .catch((err) => {
      console.error("Failed to save image to DB:", err);
    });

  return NextResponse.json({ url: imageURL });
}

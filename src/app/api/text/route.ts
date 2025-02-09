import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  // Parse the request body
  const { question } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ message: "API key is missing" }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  if (!question) {
    return new Response(
      JSON.stringify({ message: "Question is required" }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  // Create a TransformStream to handle the response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await model.generateContentStream(question);

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          controller.enqueue(chunkText);
        }
        
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    }
  });
}
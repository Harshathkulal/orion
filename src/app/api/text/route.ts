import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "@/types/types";

export async function POST(req: NextRequest) {
  // Parse the request body
  const { question, conversationHistory } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ message: "API key is missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!question) {
    return new Response(JSON.stringify({ message: "Question is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  // Prepare the full conversation context for the API request
  const fullConversation = [
    ...conversationHistory.map((msg: Message) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    })),
    { role: "user", parts: [{ text: question }] },
  ];

  // Start chat session with the full conversation context
  const chat = model.startChat({
    history: fullConversation,
  });

  // Create a TransformStream to handle the response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send the message and stream the response
        const result = await chat.sendMessageStream(question);

        // Stream the response as chunks
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          controller.enqueue(chunkText);
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// app/api/chat/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const embedder = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: process.env.GEMINI_API_KEY2!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, collectionName } = body;

    if (!query || !collectionName) {
      return NextResponse.json(
        { error: "Query and collection name are required" },
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

    return NextResponse.json({
      message: "Chat successful",
      response: textResponse,
    });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}

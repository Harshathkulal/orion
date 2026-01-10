import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import cuid from "cuid";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";
import { db } from "@/db/db";
import { documents } from "@/db/schema";
import { auth } from "@/lib/auth";
import { applyApiProtection } from "@/lib/middleware/api-protection";
import { logger } from "@/lib/logger";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Handles POST request to upload, parse, and store a PDF in vector DB.
 * Includes file validation, chunking, embeddings, and DB persistence.
 *
 * @param req - Next.js API request
 * @returns JSON response with collection details or error
 */
export async function POST(req: NextRequest) {
  let tempPath = "";

  try {
    // API protection: IP block + rate limit
    const protectionResponse = await applyApiProtection(req);
    if (protectionResponse) return protectionResponse;

    // Auth
    const authData = await auth.api.getSession({ headers: req.headers });
    const userId = authData?.session?.userId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse uploaded form data
    const formData = await req.formData();
    const file = formData.get("file");

    // Validate presence and type
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (limit: 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Save file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const originalName = file.name || "uploaded.pdf";
    const tempFileName = `${cuid()}.pdf`;
    tempPath = join(tmpdir(), tempFileName);
    await writeFile(tempPath, buffer);

    // Load PDF and split into chunks
    const loader = new PDFLoader(tempPath);
    const docs = await loader.load();
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await splitter.splitDocuments(docs);

    // Embed text using Gemini
    const embedder = new GoogleGenerativeAIEmbeddings({
      model: "text-embedding-004",
      apiKey: process.env.GEMINI_API_KEY!,
    });

    // Clean collection name and init Qdrant client
    const collectionName = uuidv4();
    const client = new QdrantClient({
      url: process.env.QDRANT_URL!,
      apiKey: process.env.QDRANT_API_KEY!,
    });

    // Drop existing collection with the same name
    if (await client.collectionExists(collectionName)) {
      await client.deleteCollection(collectionName);
    }

    // Store embeddings in Qdrant
    const vectorStore = new QdrantVectorStore(embedder, {
      client,
      collectionName,
    });
    await vectorStore.addDocuments(splitDocs);

    // Save metadata to database
    await db.insert(documents).values({
      id: cuid(),
      name: originalName,
      collectionName,
      chunkCount: splitDocs.length,
      userId,
    });

    return NextResponse.json(
      {
        message: "File processed Successfully",
        result: {
          collectionName,
          totalChunks: splitDocs.length,
        },
      },
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
  } catch (error) {
    logger.error("PDF upload error:", error as Record<string, unknown>);
    return NextResponse.json(
      { error: "Upload failed", details: String(error) },
      { status: 500 }
    );
  } finally {
    // Clean up temp file
    if (tempPath) {
      try {
        await unlink(tempPath);
      } catch (cleanupErr) {
        logger.error(
          "Failed to delete temp file:",
          cleanupErr as Record<string, unknown>
        );
      }
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

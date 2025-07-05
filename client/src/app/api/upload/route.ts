import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { auth } from '@clerk/nextjs/server';
import { rateLimit } from "@/lib/rate-limit";
import { ipFilter } from "@/lib/ip-filter";
import { logger } from "@/lib/logger";
import { createHash } from "crypto";

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { QdrantVectorStore } from '@langchain/qdrant';
import { db } from '@/db/db';
import { documents } from '@/db/schema';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let tempPath = '';

  try {
    // IP-based Protection and Filtering
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // Block potentially malicious IPs
    if (ipFilter.isBlocked(clientIp)) {
      return new NextResponse(JSON.stringify({ message: "Access denied" }), {
        status: 403,
      });
    }

    // Rate Limiting
    const identifier = createHash("sha256").update(clientIp).digest("hex");

    try {
      await rateLimit.check(identifier, 5, 300000); // 5 requests per 5 minutes for file uploads
    } catch (error) {
      logger.error("Rate limit exceeded", error as Record<string, unknown>);
      return new NextResponse(
        JSON.stringify({ message: "Too many requests" }),
        {
          status: 429,
          headers: {
            "Retry-After": "300",
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!(file as File).type.includes('pdf')) {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    if ((file as File).size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const originalName = (file as File).name || 'uploaded.pdf';

    const tempFileName = `${randomUUID()}.pdf`;
    tempPath = join(tmpdir(), tempFileName);

    await writeFile(tempPath, buffer);

    // Parse PDF
    const loader = new PDFLoader(tempPath);
    const docs = await loader.load();

    // Split into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await splitter.splitDocuments(docs);

    // Embeddings using Gemini
    const embedder = new GoogleGenerativeAIEmbeddings({
      model: 'text-embedding-004',
      apiKey: process.env.GEMINI_API_KEY!,
    });

    // Qdrant client
    const rawName = originalName.split('.pdf')[0];
    const collectionName = rawName.replace(/[^a-zA-Z0-9]/g, '_');

    const client = new QdrantClient({
      url: process.env.QDRANT_URL!,
      apiKey: process.env.QDRANT_API_KEY!,
    });

    if (await client.collectionExists(collectionName)) {
      await client.deleteCollection(collectionName);
    }

    const vectorStore = new QdrantVectorStore(embedder, {
      client,
      collectionName,
    });
    await vectorStore.addDocuments(splitDocs);

    await db.insert(documents).values({
      id: randomUUID(),
      name: originalName,
      collectionName,
      chunkCount: splitDocs.length,
      userId,
    });

    return NextResponse.json({
      message: 'PDF uploaded, parsed, and stored in Qdrant',
      collectionName,
      totalChunks: splitDocs.length,
    }, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "no-referrer",
      },
    });

  } catch (error) {
    logger.error('Upload error:', error as Record<string, unknown>);
    return NextResponse.json({ error: 'Upload failed', details: String(error) }, { status: 500 });
  } finally {
    if (tempPath) {
      try {
        await unlink(tempPath);
      } catch (cleanupErr) {
        logger.error('Failed to delete temp file:', cleanupErr as Record<string, unknown>);
      }
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

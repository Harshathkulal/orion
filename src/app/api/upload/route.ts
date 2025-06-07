import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { QdrantVectorStore } from '@langchain/qdrant';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let tempPath = '';

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
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

    return NextResponse.json({
      message: 'PDF uploaded, parsed, and stored in Qdrant',
      collectionName,
      totalChunks: splitDocs.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed', details: String(error) }, { status: 500 });
  } finally {
    if (tempPath) {
      try {
        await unlink(tempPath);
      } catch (cleanupErr) {
        console.warn('Failed to delete temp file:', cleanupErr);
      }
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

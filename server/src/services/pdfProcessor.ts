import fs from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";

interface EmbedResult {
  collectionName: string;
  totalChunks: number;
}

export const processPdfAndEmbed = async (
  buffer: Buffer,
  originalName: string
): Promise<EmbedResult> => {
  let tempPath = "";

  try {
    // 1. Save buffer to temporary file
    const tempFileName = `${randomUUID()}.pdf`;
    tempPath = path.join(tmpdir(), tempFileName);
    await fs.writeFile(tempPath, buffer);

    // 2. Load PDF content
    const loader = new PDFLoader(tempPath);
    const docs = await loader.load();
    if (!docs || docs.length === 0) {
      throw new Error("PDF could not be parsed or is empty.");
    }

    // 3. Split into text chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await splitter.splitDocuments(docs);
    if (splitDocs.length === 0) {
      throw new Error("No chunks created from PDF.");
    }

    // 4. Embed using Gemini
    const embedder = new GoogleGenerativeAIEmbeddings({
      model: "text-embedding-004",
      apiKey: process.env.GEMINI_API_KEY!,
    });

    // 5. Clean collection name and connect to Qdrant
    const collectionName = originalName.replace(/[^a-zA-Z0-9]/g, "_");
    const qdrantClient = new QdrantClient({
      url: process.env.QDRANT_URL!,
      apiKey: process.env.QDRANT_API_KEY!,
    });

    if (await qdrantClient.collectionExists(collectionName)) {
      await qdrantClient.deleteCollection(collectionName);
    }

    const vectorStore = new QdrantVectorStore(embedder, {
      client: qdrantClient,
      collectionName,
    });

    await vectorStore.addDocuments(splitDocs);

    return {
      collectionName,
      totalChunks: splitDocs.length,
    };
  } catch (error) {
    console.error("[PDF_PROCESSOR_ERROR]", error);
    throw new Error(`Embedding failed: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    // 6. Clean up temp file
    if (tempPath) {
      try {
        await fs.unlink(tempPath);
      } catch (cleanupError) {
        console.warn("[TEMP_FILE_CLEANUP_FAILED]", cleanupError);
      }
    }
  }
};

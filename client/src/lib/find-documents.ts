import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";

/**
 * Finds the most relevant documents from Qdrant for a given query.
 *
 * @param question - The user's query to match against the document collection
 * @param fileName - The Qdrant collection name (stored per uploaded file)
 * @returns A concatenated string of relevant document chunks
 */
export async function findDocuments(
  question: string,
  fileName: string
): Promise<string> {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004",
    apiKey: process.env.GEMINI_API_KEY,
  });

  const vectorStore = new QdrantVectorStore(embeddings, {
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: fileName,
  });

  // Retrieve top 3 most relevant chunks
  const results = await vectorStore.similaritySearch(question, 5);
  return results.map((doc) => doc.pageContent).join("\n\n");
}

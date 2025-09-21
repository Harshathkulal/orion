import { Document } from "@/types/types";
import api from "@/lib/axios";
const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL!;

export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await api.post(`${BASE_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const result = res.data.result;

    return {
      id: result.collectionName,
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
    };
  } catch {
    console.error("Upload failed");
    throw new Error("Upload failed");
  }
}

export async function deleteDocument(documentId: string): Promise<boolean> {
  // TODO
  // await fetch(`/api/delete/${documentId}`, { method: "DELETE" });

  return true;
}

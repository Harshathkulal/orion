import { Document } from "@/types/types";
import api from "@/lib/axios";

export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await api.post("/api/v1/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const result = res.data;

    return {
      id: result.collectionName,
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
    };
  } catch (err: any) {
    console.error("Upload failed", err);
    throw new Error(err?.response?.data?.message || "Upload failed");
  }
}

export async function deleteDocument(documentId: string): Promise<boolean> {
  // TODO
  // await fetch(`/api/delete/${documentId}`, { method: "DELETE" });

  return true;
}

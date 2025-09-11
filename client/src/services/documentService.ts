import { Document } from "@/types/types";
const BASE_URL = process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL!;

export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.message || "Upload failed");
  }

  const result = await res.json();

  return {
    id: result.collectionName,
    name: file.name,
    size: file.size,
    uploadedAt: new Date(),
  };
}

export async function deleteDocument(documentId: string): Promise<boolean> {
  // TODO
  // await fetch(`/api/delete/${documentId}`, { method: "DELETE" });

  return true;
}

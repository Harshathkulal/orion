import { Message } from "@/types/types";
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

// Stream response chunks and return final text
export async function streamResponse(
  response: Response,
  onChunk: (text: string) => void
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response stream");

  const decoder = new TextDecoder();
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    try {
      const json = JSON.parse(chunk);
      if (json.error) throw new Error(json.error);
    } catch {
      result += chunk;
      onChunk(result);
    }
  }

  reader.releaseLock();
  return result;
}

export async function sendMessage(
  apiEndpoint: string,
  payload: any
): Promise<Response> {
  const response = await fetch(`${BASE_URL}/${apiEndpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Something went wrong.");
  }

  return response;
}

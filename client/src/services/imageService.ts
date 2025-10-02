const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

export interface GenerateImageParams {
  apiEndpoint: string;
  prompt: string;
  additionalProps?: Record<string, unknown>;
  signal?: AbortSignal;
}

export async function generateImage({
  apiEndpoint,
  prompt,
  additionalProps = {},
  signal,
}: GenerateImageParams): Promise<string> {
  console.log(apiEndpoint);
  const response = await fetch(`${BASE_URL}/${apiEndpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, ...additionalProps }),
    signal,
  });

  if (!response.ok) {
    let errorMessage = "Failed to generate image";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.url;
}

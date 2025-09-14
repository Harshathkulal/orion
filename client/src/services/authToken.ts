let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

/**
 * Fetch and cache JWT token
 */
export async function getAuthToken(): Promise<string | null> {
  // Return cached token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const res = await fetch(`${BASE_URL}/token`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch token");

    const { token } = await res.json();

    // Decode token to get expiry (optional)
    const payload = JSON.parse(atob(token.split(".")[1]));
    tokenExpiry = payload.exp ? payload.exp * 1000 : Date.now() + 14 * 60 * 1000; // fallback 14min
    cachedToken = token;

    return cachedToken;
  } catch (err) {
    console.error("Failed to fetch JWT:", err);
    return null;
  }
}

/** Clear token manually on logout */
export function clearAuthToken() {
  cachedToken = null;
  tokenExpiry = null;
}

/**
 * RateLimiter.
 * Horizontal Scaling requires(Redis). TODO: Implement
 */
import { LRUCache } from "lru-cache";

class RateLimiter {
  private cache: LRUCache<string, number>;

  constructor() {
    this.cache = new LRUCache({
      max: 500, // Max number of unique identifiers tracked
      ttl: undefined, // TTL is set per item on insert
    });
  }

  /**
   * Checks if the identifier has exceeded its allowed request limit.
   * @param identifier - Unique identifier (e.g., hashed IP or user ID)
   * @param limit - Max allowed requests
   * @param window - Time window (in ms) for rate limit (e.g., 60000 for 1 min)
   * @throws Error if rate limit is exceeded
   */
  async check(
    identifier: string,
    limit: number,
    window: number
  ): Promise<void> {
    const current = this.cache.get(identifier) ?? 0;

    if (current >= limit) {
      throw new Error("Rate limit exceeded");
    }

    this.cache.set(identifier, current + 1, { ttl: window });
  }
}

export const rateLimit = new RateLimiter();

import { LRUCache } from 'lru-cache';

class RateLimiter {
  private cache: LRUCache<string, number>;

  constructor() {
    this.cache = new LRUCache({
      max: 500, // Max number of tracked IPs
      ttl: undefined // TTL will be set per entry
    });
  }

  async check(identifier: string, limit: number, window: number) {
    const current = this.cache.get(identifier) || 0;
    if (current >= limit) {
      throw new Error('Rate limit exceeded');
    }
    this.cache.set(identifier, current + 1, { ttl: window });
  }
}

export const rateLimit = new RateLimiter();

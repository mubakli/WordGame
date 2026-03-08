export class RateLimiter {
  private cache: Map<string, { count: number; expiresAt: number }>;
  private limit: number;
  private windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.cache = new Map();
    this.limit = limit;
    this.windowMs = windowMs;
  }

  isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = this.cache.get(ip);

    // Clean up expired records
    for (const [key, value] of this.cache.entries()) {
      if (value.expiresAt < now) {
        this.cache.delete(key);
      }
    }

    if (!record) {
      this.cache.set(ip, { count: 1, expiresAt: now + this.windowMs });
      return false; // Not limited
    }

    if (now > record.expiresAt) {
      // Window expired, reset counter
      this.cache.set(ip, { count: 1, expiresAt: now + this.windowMs });
      return false;
    }

    if (record.count >= this.limit) {
      return true; // Rate limited!
    }

    // Increment count
    record.count += 1;
    this.cache.set(ip, record);
    return false;
  }
}

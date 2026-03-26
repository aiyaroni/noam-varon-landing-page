// Simple in-memory rate limiter (per-process; sufficient for this scale)
const limits = new Map<string, { count: number; reset: number }>();

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param key    Unique key (e.g. "verify:1.2.3.4")
 * @param max    Max requests per window
 * @param windowMs  Window size in milliseconds
 */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = limits.get(key);
  if (!entry || now > entry.reset) {
    limits.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

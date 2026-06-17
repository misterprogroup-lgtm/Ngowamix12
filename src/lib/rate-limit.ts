const ipRequests = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function checkRateLimit(
  ip: string,
  config: RateLimitConfig = { maxRequests: 5, windowMs: 60000 }
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = ipRequests.get(ip);

  if (!record || now > record.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  record.count += 1;
  const remaining = Math.max(0, config.maxRequests - record.count);
  return { allowed: record.count <= config.maxRequests, remaining, resetAt: record.resetAt };
}

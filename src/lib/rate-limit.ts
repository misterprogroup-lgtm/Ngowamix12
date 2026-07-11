import { db } from '@/lib/db';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig = { maxRequests: 5, windowMs: 60000 }
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  try {
    const now = new Date();
    const resetAt = new Date(now.getTime() + config.windowMs);

    const record = await db.rateLimit.findUnique({ where: { key } });

    if (!record || record.resetAt < now) {
      await db.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt },
      });
      return { allowed: true, remaining: config.maxRequests - 1, resetAt: resetAt.getTime() };
    }

    await db.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });

    const remaining = Math.max(0, config.maxRequests - (record.count + 1));
    return { allowed: record.count < config.maxRequests, remaining, resetAt: record.resetAt.getTime() };
  } catch {
    return { allowed: true, remaining: config.maxRequests, resetAt: Date.now() + config.windowMs };
  }
}

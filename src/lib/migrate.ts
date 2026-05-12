import { db } from './db';

export async function ensureSchema() {
  try {
    await db.$executeRawUnsafe(
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT`
    );
    await db.$executeRawUnsafe(
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP`
    );
    console.log('[migrate] Schema sync OK');
  } catch (e) {
    console.warn('[migrate] Schema sync failed (non-fatal):', e);
  }
}

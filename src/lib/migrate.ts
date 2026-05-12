import { db } from './db';

export async function ensureSchema() {
  try {
    await db.$executeRawUnsafe(
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT`
    );
    await db.$executeRawUnsafe(
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP`
    );
    await db.$executeRawUnsafe(
      `ALTER TYPE "PaymentProvider" ADD VALUE IF NOT EXISTS 'MONEROO'`
    );
    console.log('[migrate] Schema sync OK');
  } catch (e) {
    console.warn('[migrate] Schema sync failed (non-fatal):', e);
  }
}

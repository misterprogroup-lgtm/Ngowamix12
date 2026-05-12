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
    await db.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "PromoCode" ("id" TEXT NOT NULL, "code" TEXT NOT NULL, "discountType" TEXT NOT NULL DEFAULT 'PERCENTAGE', "discountValue" INTEGER NOT NULL, "maxUses" INTEGER NOT NULL DEFAULT 0, "currentUses" INTEGER NOT NULL DEFAULT 0, "minAmount" INTEGER NOT NULL DEFAULT 0, "maxAmount" INTEGER, "expiresAt" TIMESTAMP, "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id"), CONSTRAINT "PromoCode_code_key" UNIQUE ("code"))`
    );
    await db.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "ReferralCode" ("id" TEXT NOT NULL, "code" TEXT NOT NULL, "userId" TEXT NOT NULL, "discountPercent" INTEGER NOT NULL DEFAULT 10, "maxUses" INTEGER NOT NULL DEFAULT 50, "currentUses" INTEGER NOT NULL DEFAULT 0, "expiresAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "ReferralCode_pkey" PRIMARY KEY ("id"), CONSTRAINT "ReferralCode_code_key" UNIQUE ("code"), CONSTRAINT "ReferralCode_userId_key" UNIQUE ("userId"))`
    );
    await db.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "UsedPromoCode" ("id" TEXT NOT NULL, "promoCodeId" TEXT, "referralCodeId" TEXT, "userId" TEXT NOT NULL, "transactionId" TEXT NOT NULL, "discountAmount" INTEGER NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "UsedPromoCode_pkey" PRIMARY KEY ("id"))`
    );
    console.log('[migrate] Schema sync OK');
  } catch (e) {
    console.warn('[migrate] Schema sync failed (non-fatal):', e);
  }
}

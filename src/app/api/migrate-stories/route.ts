import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    await requireRole(['ADMIN']);

    await db.$executeRawUnsafe(`ALTER TABLE "Story" ADD COLUMN IF NOT EXISTS "blobPathname" TEXT;`);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "StoryLike" (
          "id" TEXT NOT NULL,
          "storyId" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "StoryLike_pkey" PRIMARY KEY ("id")
      );
    `);

    await db.$executeRawUnsafe(`
      ALTER TABLE "StoryLike" ADD CONSTRAINT "StoryLike_storyId_fkey"
      FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);

    await db.$executeRawUnsafe(`
      ALTER TABLE "StoryLike" ADD CONSTRAINT "StoryLike_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);

    await db.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "StoryLike_storyId_idx" ON "StoryLike"("storyId");
    `);

    await db.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "StoryLike_userId_idx" ON "StoryLike"("userId");
    `);

    await db.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "StoryLike_storyId_userId_key" ON "StoryLike"("storyId", "userId");
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Migration failed' },
      { status: 500 }
    );
  }
}

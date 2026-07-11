import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const story = await db.story.findUnique({ where: { id } });
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    const existing = await db.storyLike.findUnique({
      where: { storyId_userId: { storyId: id, userId: user.sub } },
    });

    if (existing) {
      await db.storyLike.delete({ where: { id: existing.id } });
      const count = await db.storyLike.count({ where: { storyId: id } });
      return NextResponse.json({ liked: false, likesCount: count });
    }

    await db.storyLike.create({
      data: { storyId: id, userId: user.sub },
    });

    const count = await db.storyLike.count({ where: { storyId: id } });
    return NextResponse.json({ liked: true, likesCount: count });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}

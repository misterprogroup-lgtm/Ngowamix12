import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    await db.storyView.upsert({
      where: { storyId_userId: { storyId: id, userId: user.sub } },
      update: {},
      create: { storyId: id, userId: user.sub },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
}

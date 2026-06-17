import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; episodeId: string }> }
) {
  try {
    await requireAuth();
    const { episodeId } = await params;
    await db.episode.delete({ where: { id: episodeId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Episode delete error:', error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'épisode" },
      { status: 500 }
    );
  }
}

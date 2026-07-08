import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; episodeId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id, episodeId } = await params;

    const podcast = await db.podcast.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!podcast) {
      return NextResponse.json({ error: 'Podcast non trouvé' }, { status: 404 });
    }
    if (podcast.userId !== user.sub) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

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

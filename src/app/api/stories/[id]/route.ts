import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const artist = await db.artist.findUnique({ where: { userId: user.sub } });
    if (!artist) {
      return NextResponse.json({ error: 'Artiste non trouvé' }, { status: 403 });
    }

    const story = await db.story.findUnique({ where: { id } });
    if (!story || story.artistId !== artist.id) {
      return NextResponse.json({ error: 'Story non trouvée' }, { status: 404 });
    }

    await db.story.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
}

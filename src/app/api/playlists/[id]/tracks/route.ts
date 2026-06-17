import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

async function canEditPlaylist(playlistId: string, userId: string): Promise<boolean> {
  const playlist = await db.playlist.findFirst({
    where: { id: playlistId },
    select: { userId: true },
  });
  if (!playlist) return false;
  if (playlist.userId === userId) return true;

  const collaborator = await db.playlistCollaborator.findUnique({
    where: { playlistId_userId: { playlistId, userId } },
    select: { role: true },
  });
  return collaborator?.role === 'EDITOR';
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { trackId } = await request.json();

    if (!trackId) {
      return NextResponse.json(
        { error: 'trackId requis' },
        { status: 400 }
      );
    }

    const allowed = await canEditPlaylist(id, user.sub);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Playlist non trouvée' },
        { status: 404 }
      );
    }

    const existing = await db.playlistTrack.findUnique({
      where: { playlistId_trackId: { playlistId: id, trackId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ce titre est déjà dans la playlist' },
        { status: 409 }
      );
    }

    const maxSort = await db.playlistTrack.aggregate({
      where: { playlistId: id },
      _max: { sortOrder: true },
    });

    const playlistTrack = await db.playlistTrack.create({
      data: {
        playlistId: id,
        trackId,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      },
    });

    await db.playlist.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ playlistTrack }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'ajout du titre" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { trackId } = await request.json();

    if (!trackId) {
      return NextResponse.json(
        { error: 'trackId requis' },
        { status: 400 }
      );
    }

    const allowed = await canEditPlaylist(id, user.sub);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Playlist non trouvée' },
        { status: 404 }
      );
    }

    await db.playlistTrack.delete({
      where: { playlistId_trackId: { playlistId: id, trackId } },
    });

    await db.playlist.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message: 'Titre retiré de la playlist' });
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors du retrait du titre' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireAuth } from '@/lib/auth';

const playlistInclude = {
  tracks: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      track: {
        include: {
          album: {
            include: {
              artist: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
      },
    },
  },
  user: {
    select: { id: true, displayName: true, avatar: true },
  },
  collaborators: {
    include: {
      user: { select: { id: true, displayName: true, avatar: true } },
    },
  },
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentUser();

    const playlist = await db.playlist.findFirst({
      where: {
        id,
        OR: [
          { userId: session?.sub ?? '' },
          { isPublic: true },
          { collaborators: { some: { userId: session?.sub ?? '' } } },
        ],
      },
      include: playlistInclude,
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ playlist });
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la playlist' },
      { status: 500 }
    );
  }
}

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { name, description, coverImage, isPublic } = await request.json();

    const allowed = await canEditPlaylist(id, user.sub);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Playlist non trouvée' },
        { status: 404 }
      );
    }

    const playlist = await db.playlist.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(coverImage !== undefined && { coverImage }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    return NextResponse.json({ playlist });
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de la modification de la playlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const existing = await db.playlist.findFirst({
      where: { id, userId: user.sub },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Playlist non trouvée' },
        { status: 404 }
      );
    }

    await db.playlist.delete({ where: { id } });

    return NextResponse.json({ message: 'Playlist supprimée' });
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la playlist' },
      { status: 500 }
    );
  }
}

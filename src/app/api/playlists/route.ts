import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ playlists: [] });
    }

    const playlists = await db.playlist.findMany({
      where: {
        OR: [
          { userId: session.sub },
          { collaborators: { some: { userId: session.sub } } },
        ],
      },
      include: {
        _count: { select: { tracks: true } },
        user: { select: { id: true, displayName: true } },
        collaborators: {
          include: { user: { select: { id: true, displayName: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ playlists });
  } catch {
    return NextResponse.json({ playlists: [] });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le nom de la playlist est requis' },
        { status: 400 }
      );
    }

    const playlist = await db.playlist.create({
      data: {
        name: name.trim(),
        userId: user.sub,
      },
    });

    return NextResponse.json({ playlist }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de la création de la playlist' },
      { status: 500 }
    );
  }
}

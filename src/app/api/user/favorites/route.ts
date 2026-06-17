import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const artistId = searchParams.get('artistId');

    if (type === 'artist' && artistId) {
      const existing = await db.favorite.findFirst({
        where: { userId: user.sub, artistId },
      });
      return NextResponse.json({ following: !!existing });
    }

    const [tracks, albums, artists] = await Promise.all([
      db.favorite.findMany({
        where: { userId: user.sub, trackId: { not: null } },
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
        orderBy: { createdAt: 'desc' },
      }),
      db.favorite.findMany({
        where: { userId: user.sub, albumId: { not: null } },
        include: {
          album: {
            include: {
              artist: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.favorite.findMany({
        where: { userId: user.sub, artistId: { not: null } },
        include: {
          artist: {
            select: { id: true, name: true, slug: true, avatar: true, bio: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({ tracks, albums, artists });
  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des favoris' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { trackId, albumId, artistId } = body;

    if (!trackId && !albumId && !artistId) {
      return NextResponse.json(
        { error: 'trackId, albumId ou artistId requis' },
        { status: 400 }
      );
    }

    const existing = await db.favorite.findFirst({
      where: { userId: user.sub, trackId, albumId, artistId },
    });

    if (existing) {
      await db.favorite.delete({ where: { id: existing.id } });
      const message = artistId ? 'Artiste non suivi' : 'Retiré des favoris';
      return NextResponse.json({ action: 'removed', message });
    }

    const favorite = await db.favorite.create({
      data: {
        userId: user.sub,
        trackId: trackId || null,
        albumId: albumId || null,
        artistId: artistId || null,
      },
    });

    const message = artistId ? 'Artiste suivi' : 'Ajouté aux favoris';
    return NextResponse.json({ action: 'added', favorite, message });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la gestion des favoris' },
      { status: 500 }
    );
  }
}

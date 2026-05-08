import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();

    const [tracks, albums] = await Promise.all([
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
    ]);

    return NextResponse.json({ tracks, albums });
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
    const { trackId, albumId } = body;

    if (!trackId && !albumId) {
      return NextResponse.json(
        { error: 'trackId ou albumId requis' },
        { status: 400 }
      );
    }

    const existing = await db.favorite.findFirst({
      where: { userId: user.sub, trackId, albumId },
    });

    if (existing) {
      await db.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: 'removed', message: 'Retiré des favoris' });
    }

    const favorite = await db.favorite.create({
      data: {
        userId: user.sub,
        trackId: trackId || null,
        albumId: albumId || null,
      },
    });

    return NextResponse.json({ action: 'added', favorite });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la gestion des favoris' },
      { status: 500 }
    );
  }
}

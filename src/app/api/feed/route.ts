import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = await checkRateLimit(`feed:${ip}`, { maxRequests: 30, windowMs: 60000 });
    if (!allowed) return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const followedArtistIds = (
      await db.favorite.findMany({
        where: { userId: user.sub, artistId: { not: null } },
        select: { artistId: true },
      })
    ).map((f) => f.artistId).filter(Boolean) as string[];

    const activities = await db.activity.findMany({
      where: {
        userId: { in: followedArtistIds },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { id: true, displayName: true, avatar: true } },
        track: {
          select: {
            id: true, title: true, slug: true, duration: true,
            album: { select: { slug: true, coverImage: true, artist: { select: { name: true, slug: true } } } },
          },
        },
        album: {
          select: {
            id: true, title: true, slug: true, coverImage: true,
            artist: { select: { name: true, slug: true } },
          },
        },
        artist: {
          select: { id: true, name: true, slug: true, avatar: true },
        },
      },
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Feed error:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement du fil' }, { status: 500 });
  }
}

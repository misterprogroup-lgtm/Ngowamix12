import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = await checkRateLimit(`search:${ip}`, { maxRequests: 60, windowMs: 60000 });
    if (!allowed) return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!q.trim()) {
      return NextResponse.json({ tracks: [], albums: [], artists: [] });
    }

    const [tracks, albums, artists] = await Promise.all([
      db.track.findMany({
        where: {
          title: { contains: q, mode: 'insensitive' },
          album: { artist: { user: { role: { not: 'ADMIN' } } } },
        },
        include: {
          album: {
            include: {
              artist: {
                select: { id: true, name: true, slug: true, avatar: true, isVerified: true },
              },
            },
          },
        },
        orderBy: { playCount: 'desc' },
        take: limit,
      }),
      db.album.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { artist: { name: { contains: q, mode: 'insensitive' } } },
          ],
        },
        include: {
          artist: {
            select: { id: true, name: true, slug: true, avatar: true, isVerified: true },
          },
        },
        orderBy: { playCount: 'desc' },
        take: limit,
      }),
      db.artist.findMany({
        where: {
          user: { role: { not: 'ADMIN' } },
          name: { contains: q, mode: 'insensitive' },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          avatar: true,
          coverImage: true,
          bio: true,
          country: true,
          genres: true,
          isVerified: true,
        },
        orderBy: { name: 'asc' },
        take: limit,
      }),
    ]);

    return NextResponse.json({ tracks, albums, artists });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = await checkRateLimit(`albums:${ip}`, { maxRequests: 60, windowMs: 60000 });
    if (!allowed) return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const genre = searchParams.get('genre');
    const country = searchParams.get('country');
    const type = searchParams.get('type');

    const where: Record<string, unknown> = {
      status: 'PUBLISHED',
      artist: { user: { role: { not: 'ADMIN' } } },
    };

    if (genre) where.genre = genre;
    if (country) where.country = country;
    if (type && ['ALBUM', 'SINGLE', 'EP'].includes(type)) where.type = type;

    const [albums, total] = await Promise.all([
      db.album.findMany({
        where,
        include: {
          artist: {
            select: {
              id: true,
              name: true,
              slug: true,
              avatar: true,
              isVerified: true,
            },
          },
          _count: {
            select: { reviews: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.album.count({ where }),
    ]);

    const ratings = albums.length > 0
      ? await db.review.groupBy({
          by: ['albumId'],
          where: { albumId: { in: albums.map(a => a.id) } },
          _avg: { rating: true },
        })
      : [];
    const ratingMap = new Map(ratings.map(r => [r.albumId, r._avg.rating || 0]));
    const albumsWithRatings = albums.map(album => ({
      ...album,
      averageRating: ratingMap.get(album.id) || 0,
      totalReviews: album._count.reviews,
    }));

    return NextResponse.json({
      albums: albumsWithRatings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Albums fetch error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des albums' },
      { status: 500 }
    );
  }
}

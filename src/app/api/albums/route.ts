import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const genre = searchParams.get('genre');
    const country = searchParams.get('country');
    const type = searchParams.get('type');

    const where: Record<string, unknown> = { status: 'PUBLISHED' };

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

    const albumsWithRatings = await Promise.all(
      albums.map(async (album) => {
        const stats = await db.review.aggregate({
          where: { albumId: album.id },
          _avg: { rating: true },
        });
        return {
          ...album,
          averageRating: stats._avg.rating || 0,
          totalReviews: album._count.reviews,
        };
      }),
    );

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

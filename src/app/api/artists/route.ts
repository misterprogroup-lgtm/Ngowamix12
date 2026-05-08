import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const country = searchParams.get('country');
    const genre = searchParams.get('genre');

    const where: Record<string, unknown> = {};

    if (country) where.country = country;
    if (genre) where.genres = { contains: genre };

    const allArtists = await db.artist.findMany({
      where: {
        ...where,
        user: { role: { not: 'ADMIN' } },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        avatar: true,
        bio: true,
        coverImage: true,
        country: true,
        genres: true,
        socialLinks: true,
        isVerified: true,
        albums: {
          select: {
            tracks: {
              select: { playCount: true },
            },
          },
        },
        _count: {
          select: { albums: true },
        },
      },
    });

    const sorted = allArtists
      .map(({ albums, ...rest }) => ({
        ...rest,
        totalPlayCount: albums.reduce(
          (sum, album) => sum + album.tracks.reduce((s, t) => s + t.playCount, 0),
          0
        ),
      }))
      .sort((a, b) => b.totalPlayCount - a.totalPlayCount);

    const artists = sorted.slice((page - 1) * limit, page * limit);
    const total = allArtists.length;

    return NextResponse.json({
      artists,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Artists fetch error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des artistes' },
      { status: 500 }
    );
  }
}

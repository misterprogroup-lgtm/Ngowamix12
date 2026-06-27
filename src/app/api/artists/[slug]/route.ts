import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const artist = await db.artist.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        avatar: true,
        coverImage: true,
        bio: true,
        genres: true,
        isVerified: true,
        verificationStatus: true,
        country: true,
        socialLinks: true,
        _count: { select: { albums: true } },
      },
    });

    if (!artist) {
      return NextResponse.json(
        { error: 'Artiste introuvable' },
        { status: 404 }
      );
    }

    const albums = await db.album.findMany({
      where: { artistId: artist.id, status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        type: true,
        genre: true,
        releaseDate: true,
        totalTracks: true,
        duration: true,
        price: true,
        playCount: true,
        purchaseCount: true,
        createdAt: true,
        artist: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json({
      artist: {
        id: artist.id,
        name: artist.name,
        slug: artist.slug,
        avatar: artist.avatar,
        coverImage: artist.coverImage,
        bio: artist.bio,
        genres: artist.genres,
        isVerified: artist.isVerified,
        country: artist.country,
        albumCount: artist._count.albums,
      },
      albums,
    });
  } catch (error) {
    console.error('Artist detail error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'artiste' },
      { status: 500 }
    );
  }
}

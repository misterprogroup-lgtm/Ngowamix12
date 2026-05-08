import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireRole(['ARTIST', 'LABEL', 'ADMIN']);

    const artist = await db.artist.findUnique({
      where: { userId: user.sub },
    });

    if (!artist) {
      return NextResponse.json(
        { error: 'Profil artiste non trouvé' },
        { status: 403 }
      );
    }

    const [albums, tracks, totalPlays, totalPurchases] = await Promise.all([
      db.album.count({ where: { artistId: artist.id } }),
      db.track.count({
        where: {
          album: { artistId: artist.id },
        },
      }),
      db.track.aggregate({
        where: {
          album: { artistId: artist.id },
        },
        _sum: { playCount: true },
      }),
      db.album.aggregate({
        where: { artistId: artist.id },
        _sum: { purchaseCount: true },
      }),
    ]);

    const recentAlbums = await db.album.findMany({
      where: { artistId: artist.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        playCount: true,
        purchaseCount: true,
        price: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      stats: {
        albums,
        tracks,
        totalPlays: totalPlays._sum.playCount || 0,
        totalPurchases: totalPurchases._sum.purchaseCount || 0,
      },
      recentAlbums,
      artist: {
        name: artist.name,
        slug: artist.slug,
        bio: artist.bio,
        avatar: artist.avatar,
        country: artist.country,
        genres: artist.genres,
        isVerified: artist.isVerified,
        socialLinks: artist.socialLinks,
        coverImage: artist.coverImage,
        balance: artist.balance,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du dashboard' },
      { status: 500 }
    );
  }
}

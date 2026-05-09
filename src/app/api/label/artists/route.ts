import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const user = await requireAuth();

    if (user.role !== 'LABEL') {
      return NextResponse.json(
        { error: 'Accès réservé aux labels' },
        { status: 403 }
      );
    }

    const fullUser = await db.user.findUnique({
      where: { id: user.sub },
      select: { labelName: true, label: true },
    });

    let label = fullUser?.label;

    if (!label && fullUser?.labelName) {
      label = await db.label.create({
        data: {
          name: fullUser.labelName,
          slug: slugify(fullUser.labelName),
          userId: user.sub,
        },
      });
    }

    if (!label) {
      return NextResponse.json(
        { error: 'Aucun label trouvé' },
        { status: 404 }
      );
    }

    const labelWithArtists = await db.label.findUnique({
      where: { id: label.id },
      include: {
        artists: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                displayName: true,
                avatar: true,
                phone: true,
                phoneVerified: true,
              },
            },
            albums: {
              select: {
                id: true,
                title: true,
                status: true,
                playCount: true,
                purchaseCount: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    const artists = (labelWithArtists?.artists || []).map((artist) => ({
      id: artist.id,
      name: artist.name,
      slug: artist.slug,
      avatar: artist.avatar,
      isVerified: artist.isVerified,
      verificationStatus: artist.verificationStatus,
      balance: artist.balance,
      bio: artist.bio,
      genres: artist.genres,
      user: artist.user,
      albums: artist.albums.map((a) => ({
        id: a.id,
        title: a.title,
        status: a.status,
        playCount: a.playCount,
        purchaseCount: a.purchaseCount,
        createdAt: a.createdAt,
      })),
      albumCount: artist.albums.length,
      totalPlays: artist.albums.reduce((sum, a) => sum + a.playCount, 0),
      totalPurchases: artist.albums.reduce((sum, a) => sum + a.purchaseCount, 0),
    }));

    return NextResponse.json({
      label: {
        id: label.id,
        name: label.name,
        slug: label.slug,
      },
      artists,
      totalArtists: artists.length,
    });
  } catch (error) {
    console.error('Label artists error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des artistes' },
      { status: 500 }
    );
  }
}

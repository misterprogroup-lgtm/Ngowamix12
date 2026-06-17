import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { slugify, maybeProxyAvatar } from '@/lib/utils';

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
      select: { labelName: true, displayName: true, label: true, artist: { select: { avatar: true } } },
    });

    let label = fullUser?.label;

    if (!label) {
      const labelName = fullUser?.labelName || fullUser?.displayName || 'Mon Label';
      label = await db.label.create({
        data: {
          name: labelName,
          slug: slugify(labelName),
          userId: user.sub,
        },
      });
    }

    const labelWithArtists = await db.label.findUnique({
      where: { id: label.id },
      include: {
        user: {
          select: { avatar: true },
        },
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

    const userAvatar = labelWithArtists?.user?.avatar || null;
    const artistAvatar = fullUser?.artist?.avatar || null;
    const avatar = maybeProxyAvatar(artistAvatar || userAvatar);

    return NextResponse.json({
      label: {
        id: label.id,
        name: label.name,
        slug: label.slug,
        avatar,
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

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await requireRole(['ADMIN']);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status && ['PENDING', 'VERIFIED', 'REJECTED'].includes(status)) {
      where.verificationStatus = status;
    }

    const artists = await db.artist.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true,
          },
        },
        _count: {
          select: { albums: true },
        },
      },
      orderBy: [{ verificationRequestedAt: 'desc' }, { createdAt: 'desc' }],
    });

    const pendingCount = await db.artist.count({
      where: { verificationStatus: 'PENDING' },
    });

    return NextResponse.json({ artists, pendingCount });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    console.error('Get artists verification error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des artistes' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole(['ADMIN']);

    const { artistId, action } = await request.json();

    if (!artistId || !['verify', 'reject', 'reset'].includes(action)) {
      return NextResponse.json(
        { error: 'Paramètres invalides' },
        { status: 400 }
      );
    }

    const artist = await db.artist.findUnique({
      where: { id: artistId },
      include: { user: { select: { id: true } } },
    });

    if (!artist) {
      return NextResponse.json(
        { error: 'Artiste introuvable' },
        { status: 404 }
      );
    }

    if (action === 'verify') {
      await db.artist.update({
        where: { id: artistId },
        data: {
          verificationStatus: 'VERIFIED',
          isVerified: true,
        },
      });

      await db.notification.create({
        data: {
          type: 'SYSTEM',
          title: 'Compte artiste vérifié',
          message: `Le compte de ${artist.name} a été vérifié par l'administration.`,
          referenceId: artistId,
          referenceType: 'ARTIST_VERIFICATION',
        },
      });
    } else if (action === 'reject') {
      await db.artist.update({
        where: { id: artistId },
        data: {
          verificationStatus: 'REJECTED',
          isVerified: false,
          verificationRequestedAt: null,
        },
      });
    } else if (action === 'reset') {
      await db.artist.update({
        where: { id: artistId },
        data: {
          verificationStatus: 'NONE',
          isVerified: false,
          verificationRequestedAt: null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    console.error('Update artist verification error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

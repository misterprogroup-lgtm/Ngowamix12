import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function POST() {
  try {
    const user = await requireRole(['ARTIST', 'LABEL']);

    const artist = await db.artist.findUnique({
      where: { userId: user.sub },
    });

    if (!artist) {
      return NextResponse.json(
        { error: 'Profil artiste non trouvé' },
        { status: 403 }
      );
    }

    if (artist.verificationStatus === 'VERIFIED') {
      return NextResponse.json(
        { error: 'Votre compte est déjà vérifié' },
        { status: 400 }
      );
    }

    if (artist.verificationStatus === 'PENDING') {
      return NextResponse.json(
        { error: 'Une demande de vérification est déjà en cours' },
        { status: 400 }
      );
    }

    const updated = await db.artist.update({
      where: { id: artist.id },
      data: {
        verificationStatus: 'PENDING',
        verificationRequestedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        verificationStatus: true,
        verificationRequestedAt: true,
      },
    });

    await db.notification.create({
      data: {
        type: 'SYSTEM',
        title: `Demande de vérification de ${artist.name}`,
        message: `${artist.name} a demandé la vérification de son compte artiste.`,
        referenceId: artist.id,
        referenceType: 'ARTIST_VERIFICATION',
      },
    });

    return NextResponse.json({ artist: updated });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    console.error('Request verification error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la demande de vérification' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await requireRole(['ARTIST', 'LABEL']);

    const artist = await db.artist.findUnique({
      where: { userId: user.sub },
      select: {
        id: true,
        name: true,
        slug: true,
        verificationStatus: true,
        verificationRequestedAt: true,
        isVerified: true,
      },
    });

    if (!artist) {
      return NextResponse.json(
        { error: 'Profil artiste non trouvé' },
        { status: 403 }
      );
    }

    return NextResponse.json({ artist });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    console.error('Get verification status error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['ARTIST', 'LABEL', 'ADMIN']);
    const { id } = await params;

    const artist = await db.artist.findUnique({
      where: { userId: user.sub },
    });

    if (!artist) {
      return NextResponse.json(
        { error: 'Profil artiste non trouvé' },
        { status: 403 }
      );
    }

    const album = await db.album.findUnique({
      where: { id },
      include: {
        tracks: {
          orderBy: { trackNumber: 'asc' },
        },
      },
    });

    if (!album || album.artistId !== artist.id) {
      return NextResponse.json(
        { error: 'Album non trouvé ou non autorisé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ album });
  } catch (error) {
    console.error('Get album error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'album' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['ARTIST', 'LABEL', 'ADMIN']);
    const { id } = await params;

    const artist = await db.artist.findUnique({
      where: { userId: user.sub },
    });

    if (!artist) {
      return NextResponse.json(
        { error: 'Profil artiste non trouvé' },
        { status: 403 }
      );
    }

    if (!artist.isVerified && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Votre compte artiste doit être vérifié avant de pouvoir modifier des albums.' },
        { status: 403 }
      );
    }

    const album = await db.album.findUnique({
      where: { id },
      select: { artistId: true },
    });

    if (!album || album.artistId !== artist.id) {
      return NextResponse.json(
        { error: 'Album non autorisé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, genre, country, price, releaseDate, isPremiumOnly, status } = body;

    const updated = await db.album.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(genre !== undefined && { genre }),
        ...(country !== undefined && { country }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(releaseDate !== undefined && { releaseDate: releaseDate ? new Date(releaseDate) : null }),
        ...(isPremiumOnly !== undefined && { isPremiumOnly }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({ album: updated });
  } catch (error) {
    console.error('Update album error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'album' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['ARTIST', 'LABEL', 'ADMIN']);
    const { id } = await params;

    const artist = await db.artist.findUnique({
      where: { userId: user.sub },
    });

    if (!artist) {
      return NextResponse.json(
        { error: 'Profil artiste non trouvé' },
        { status: 403 }
      );
    }

    if (!artist.isVerified && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Votre compte artiste doit être vérifié avant de pouvoir supprimer des albums.' },
        { status: 403 }
      );
    }

    const album = await db.album.findUnique({
      where: { id },
      select: { artistId: true, status: true },
    });

    if (!album || album.artistId !== artist.id) {
      return NextResponse.json(
        { error: 'Album non autorisé' },
        { status: 403 }
      );
    }

    await db.track.deleteMany({ where: { albumId: id } });
    await db.album.delete({ where: { id } });

    return NextResponse.json({ message: 'Album supprimé' });
  } catch (error) {
    console.error('Delete album error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'album' },
      { status: 500 }
    );
  }
}

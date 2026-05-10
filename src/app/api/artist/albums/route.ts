import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { uploadFile } from '@/lib/upload';
import { slugify } from '@/lib/utils';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
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

    if (!artist.isVerified && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Votre compte artiste doit être vérifié avant de pouvoir publier. Contactez l\'administration.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const type = formData.get('type') as string || 'ALBUM';
    const description = formData.get('description') as string;
    const genre = formData.get('genre') as string;
    const country = formData.get('country') as string;
    const price = parseFloat(formData.get('price') as string) || 0;
    const releaseDate = formData.get('releaseDate') as string;
    const isPremiumOnly = formData.get('isPremiumOnly') === 'true';
    const coverFile = formData.get('cover') as File | null;

    if (!title) {
      return NextResponse.json(
        { error: 'Le titre de l\'album est requis' },
        { status: 400 }
      );
    }

    const slug = slugify(title) + '-' + Date.now().toString(36);

    let coverPath: string | null = null;
    if (coverFile && coverFile.size > 0) {
      const buffer = Buffer.from(await coverFile.arrayBuffer());
      const filename = `${Date.now()}-${coverFile.name}`;
      const result = await uploadFile(buffer, filename, 'covers');
      coverPath = result.url;
    }

    const album = await db.album.create({
      data: {
        artistId: artist.id,
        title,
        slug,
        type: type as 'ALBUM' | 'SINGLE' | 'EP',
        description: description || null,
        genre: genre || null,
        country: country || null,
        price,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        status: type === 'SINGLE' ? 'PUBLISHED' : 'SUBMITTED',
        isPremiumOnly,
        coverImage: coverPath,
      },
    });

    if (type !== 'SINGLE') {
      await db.notification.create({
        data: {
          type: 'ALBUM_SUBMISSION',
          title: `${artist.name} a soumis un(e) ${type === 'EP' ? 'EP' : 'Album'}`,
          message: `${artist.name} a soumis "${title}" pour validation.`,
          referenceId: album.id,
          referenceType: 'ALBUM',
        },
      });
    } else {
      const listeners = await db.user.findMany({
        where: { role: 'LISTENER' },
        select: { id: true },
      });
      await db.notification.createMany({
        data: listeners.map((listener) => ({
          userId: listener.id,
          type: 'SYSTEM',
          title: `Nouveau Single : ${title}`,
          message: `"${title}" de ${artist.name} est maintenant disponible.`,
          referenceId: album.id,
          referenceType: 'ALBUM',
        })),
      });
    }

    return NextResponse.json({ album }, { status: 201 });
  } catch (error) {
    console.error('Create album error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'album' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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

    const albums = await db.album.findMany({
      where: { artistId: artist.id },
      include: {
        _count: {
          select: { tracks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ albums });
  } catch (error) {
    console.error('Get albums error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des albums' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireRole(['ARTIST', 'LABEL', 'ADMIN']);
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('id');

    if (!albumId) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 });
    }

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
      where: { id: albumId },
      include: { _count: { select: { tracks: true, purchases: true } } },
    });

    if (!album || album.artistId !== artist.id) {
      return NextResponse.json(
        { error: 'Album introuvable ou non autorisé' },
        { status: 403 }
      );
    }

    await db.album.delete({ where: { id: albumId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    console.error('Delete album error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}

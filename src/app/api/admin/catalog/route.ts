import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { sendPushToAllListeners } from '@/lib/push';

export async function GET(request: Request) {
  try {
    await requireRole(['ADMIN']);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const [albums, total] = await Promise.all([
      db.album.findMany({
        where,
        include: {
          artist: {
            select: { name: true, slug: true },
          },
          _count: {
            select: { tracks: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.album.count({ where }),
    ]);

    return NextResponse.json({
      albums,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Admin catalog error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du catalogue' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await requireRole(['ADMIN']);

    const body = await request.json();
    const { albumId, action } = body;

    if (!albumId || !action) {
      return NextResponse.json(
        { error: 'albumId et action sont requis' },
        { status: 400 }
      );
    }

    let status: string;
    switch (action) {
      case 'validate':
        status = 'PUBLISHED';
        break;
      case 'reject':
        status = 'REJECTED';
        break;
      case 'draft':
        status = 'DRAFT';
        break;
      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        );
    }

    const album = await db.album.update({
      where: { id: albumId },
      data: { status: status as never },
      include: { artist: { select: { name: true } } },
    });

    if (status === 'PUBLISHED') {
      const listeners = await db.user.findMany({
        where: { role: 'LISTENER' },
        select: { id: true },
      });
      const label = album.type === 'SINGLE' ? 'Single' : album.type === 'EP' ? 'EP' : 'Album';
      await db.notification.createMany({
        data: listeners.map((listener) => ({
          userId: listener.id,
          type: 'SYSTEM',
          title: `Nouveau ${label} : ${album.title}`,
          message: `"${album.title}" de ${album.artist.name} est maintenant disponible.`,
          referenceId: albumId,
          referenceType: 'ALBUM',
        })),
      });
      const fullAlbum = await db.album.findUnique({
        where: { id: albumId },
        select: { slug: true },
      });
      await sendPushToAllListeners({
        title: `Nouveau ${label} : ${album.title}`,
        body: `"${album.title}" de ${album.artist.name} est maintenant disponible.`,
        url: fullAlbum?.slug ? `/album/${fullAlbum.slug}` : '/',
      });
    }

    return NextResponse.json({ album });
  } catch (error) {
    console.error('Admin catalog action error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'action sur l\'album' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireRole(['ADMIN']);

    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('id');

    if (!albumId) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 });
    }

    const album = await db.album.findUnique({
      where: { id: albumId },
      include: { artist: { select: { name: true } } },
    });

    if (!album) {
      return NextResponse.json({ error: 'Album introuvable' }, { status: 404 });
    }

    await db.album.delete({ where: { id: albumId } });

    await db.notification.create({
      data: {
        type: 'SYSTEM',
        title: `Album supprimé par l'administration`,
        message: `L'album "${album.title}" de ${album.artist.name} a été supprimé par l'administration pour litige.`,
        referenceId: albumId,
        referenceType: 'ALBUM_DELETION',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    console.error('Admin delete album error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}

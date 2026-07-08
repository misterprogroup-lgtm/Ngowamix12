import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const podcast = await db.podcast.findUnique({
      where: { id },
      include: {
        user: {
          select: { displayName: true, avatar: true },
        },
        episodes: {
          orderBy: { episodeNumber: 'asc' },
          where: { isPublished: true },
        },
      },
    });

    if (!podcast) {
      return NextResponse.json(
        { error: 'Podcast non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ podcast });
  } catch (error) {
    console.error('Podcast fetch error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du podcast' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const existing = await db.podcast.findUnique({ where: { id }, select: { userId: true } });
    if (!existing) {
      return NextResponse.json({ error: 'Podcast non trouvé' }, { status: 404 });
    }
    if (existing.userId !== user.sub) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { title, slug, description, coverImage, category, author, isPublished } = body;

    const podcast = await db.podcast.update({
      where: { id },
      data: { title, slug, description, coverImage, category, author, isPublished },
    });

    return NextResponse.json({ podcast });
  } catch (error) {
    console.error('Podcast update error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du podcast' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const existing = await db.podcast.findUnique({ where: { id }, select: { userId: true } });
    if (!existing) {
      return NextResponse.json({ error: 'Podcast non trouvé' }, { status: 404 });
    }
    if (existing.userId !== user.sub) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    await db.podcast.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Podcast delete error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du podcast' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { albumId, rating, comment } = await request.json();

    if (!albumId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Note invalide (1-5 requis)' },
        { status: 400 }
      );
    }

    const album = await db.album.findUnique({
      where: { id: albumId },
      select: { artistId: true },
    });

    if (!album) {
      return NextResponse.json({ error: 'Album introuvable' }, { status: 404 });
    }

    if (album.artistId) {
      const artist = await db.artist.findUnique({
        where: { id: album.artistId },
        select: { userId: true },
      });
      if (artist?.userId === user.sub) {
        return NextResponse.json(
          { error: 'Vous ne pouvez pas noter vos propres albums' },
          { status: 403 }
        );
      }
    }

    const review = await db.review.upsert({
      where: {
        userId_albumId: { userId: user.sub, albumId },
      },
      create: {
        albumId,
        userId: user.sub,
        rating,
        comment: comment?.trim() || null,
      },
      update: {
        rating,
        comment: comment?.trim() || null,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    console.error('Create review error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de l\'avis' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('albumId');

    if (!albumId) {
      return NextResponse.json({ error: 'albumId requis' }, { status: 400 });
    }

    const reviews = await db.review.findMany({
      where: { albumId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const stats = await db.review.aggregate({
      where: { albumId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return NextResponse.json({
      reviews,
      averageRating: stats._avg.rating || 0,
      totalReviews: stats._count.rating,
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des avis' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 });
    }

    const review = await db.review.findUnique({ where: { id: reviewId } });

    if (!review || review.userId !== user.sub) {
      return NextResponse.json({ error: 'Avis introuvable ou non autorisé' }, { status: 403 });
    }

    await db.review.delete({ where: { id: reviewId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    console.error('Delete review error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'avis' },
      { status: 500 }
    );
  }
}

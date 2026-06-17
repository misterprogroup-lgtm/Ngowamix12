import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const category = searchParams.get('category');

    const where: Record<string, unknown> = { isPublished: true };

    if (category) where.category = category;

    const [podcasts, total] = await Promise.all([
      db.podcast.findMany({
        where,
        include: {
          user: {
            select: { displayName: true, avatar: true },
          },
          _count: {
            select: { episodes: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.podcast.count({ where }),
    ]);

    return NextResponse.json({
      podcasts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Podcasts fetch error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des podcasts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { title, slug, description, coverImage, category, author } = body;
    const userId = user.sub;

    if (!userId || !title || !slug) {
      return NextResponse.json(
        { error: 'userId, title et slug requis' },
        { status: 400 }
      );
    }

    const podcast = await db.podcast.create({
      data: { userId, title, slug, description, coverImage, category, author },
    });

    return NextResponse.json({ podcast }, { status: 201 });
  } catch (error) {
    console.error('Podcast create error:', error);
    return NextResponse.json(
      { error: "Erreur lors de la création du podcast" },
      { status: 500 }
    );
  }
}

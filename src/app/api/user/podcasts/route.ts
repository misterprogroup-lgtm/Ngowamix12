import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);

    const podcasts = await db.podcast.findMany({
      where: { userId: user.sub },
      include: {
        _count: {
          select: { episodes: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ podcasts });
  } catch (error) {
    console.error('User podcasts fetch error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des podcasts' },
      { status: 500 }
    );
  }
}

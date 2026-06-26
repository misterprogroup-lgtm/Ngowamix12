import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const where = {
      album: {
        type: 'SINGLE' as const,
        status: 'PUBLISHED' as const,
        artist: { user: { role: { not: 'ADMIN' as const } } },
      },
    };

    const [tracks, total] = await Promise.all([
      db.track.findMany({
        where,
        include: {
          album: {
            select: {
              id: true,
              title: true,
              coverImage: true,
              artist: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  avatar: true,
                  isVerified: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.track.count({ where }),
    ]);

    return NextResponse.json({
      tracks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Singles fetch error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des singles' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const where: Record<string, unknown> = { status: 'PUBLISHED', type: 'SINGLE' };

    const [singles, total] = await Promise.all([
      db.album.findMany({
        where,
        include: {
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
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.album.count({ where }),
    ]);

    return NextResponse.json({
      singles,
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

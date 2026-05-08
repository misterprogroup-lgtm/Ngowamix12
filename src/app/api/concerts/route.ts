import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const city = searchParams.get('city');

    const where: Record<string, unknown> = { isActive: true, date: { gte: new Date() } };

    if (city) where.city = city;

    const [concerts, total] = await Promise.all([
      db.concert.findMany({
        where,
        include: {
          artist: {
            select: { name: true, slug: true, avatar: true, isVerified: true },
          },
        },
        orderBy: { date: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.concert.count({ where }),
    ]);

    return NextResponse.json({
      concerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Concerts fetch error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des concerts' },
      { status: 500 }
    );
  }
}

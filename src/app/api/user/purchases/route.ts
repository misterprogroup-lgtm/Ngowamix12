import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();

    const purchases = await db.purchase.findMany({
      where: { userId: user.sub },
      include: {
        album: {
          include: {
            artist: {
              select: {
                name: true,
                slug: true,
              },
            },
            _count: {
              select: { tracks: true },
            },
          },
        },
        transaction: {
          select: {
            status: true,
            paymentMethod: true,
          },
        },
      },
      orderBy: { purchasedAt: 'desc' },
    });

    return NextResponse.json({ purchases });
  } catch (error) {
    console.error('Get purchases error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des achats' },
      { status: 500 }
    );
  }
}

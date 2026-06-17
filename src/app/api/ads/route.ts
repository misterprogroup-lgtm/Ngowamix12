import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement') || undefined;

    const where = {
      isActive: true,
      ...(placement ? { placement: placement as 'POPUP' | 'BANNER' | 'SIDEBAR' } : {}),
    };

    const ads = await db.ad.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(ads);
  } catch (error) {
    console.error('Get public ads error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des publicités' },
      { status: 500 }
    );
  }
}

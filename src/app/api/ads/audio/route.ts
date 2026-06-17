import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const ads = await db.ad.findMany({
      where: { placement: 'AUDIO', isActive: true, audioFile: { not: null } },
      orderBy: { sortOrder: 'asc' },
      take: 5,
    });

    if (ads.length === 0) {
      return NextResponse.json({ ad: null });
    }

    const ad = ads[Math.floor(Math.random() * ads.length)];

    return NextResponse.json({
      ad: {
        id: ad.id,
        sponsor: ad.sponsor,
        text: ad.text,
        audioFile: ad.audioFile,
      },
    });
  } catch (error) {
    console.error('Get audio ad error:', error);
    return NextResponse.json({ ad: null }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    await requireRole(['ADMIN']);

    const ads = await db.ad.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(ads);
  } catch (error) {
    console.error('Get ads error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des publicités' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(['ADMIN']);
    const body = await request.json();
    const { image, sponsor, text, link, audioFile, placement, isActive, sortOrder } = body;

    if (!sponsor || !text) {
      return NextResponse.json(
        { error: 'sponsor et text sont requis' },
        { status: 400 }
      );
    }

    const ad = await db.ad.create({
      data: {
        image: image || '',
        sponsor,
        text,
        link: link || null,
        audioFile: audioFile || null,
        placement: placement || 'POPUP',
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(ad, { status: 201 });
  } catch (error) {
    console.error('Create ad error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la publicité' },
      { status: 500 }
    );
  }
}

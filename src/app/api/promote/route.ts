import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

const PROMO_PRICES: Record<string, number> = {
  '1_day': 500,
  '3_days': 1200,
  '7_days': 2500,
  '14_days': 4500,
  '30_days': 8000,
};

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const { placement, duration, targetType, targetId, image, text, link } = await req.json();
    if (!placement || !duration || !image || !text) {
      return NextResponse.json({ error: 'Champs requis: placement, duration, image, text' }, { status: 400 });
    }

    const days = parseInt(duration.replace('_days', ''), 10);
    const amount = PROMO_PRICES[duration];
    if (!amount) {
      return NextResponse.json({ error: 'Durée invalide' }, { status: 400 });
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + days * 86400000);

    const ad = await db.ad.create({
      data: {
        sponsor: user.email.split('@')[0],
        text,
        image,
        link: link || null,
        placement,
        userId: user.sub,
        targetType: targetType || null,
        targetId: targetId || null,
        startDate,
        endDate,
        status: 'PENDING',
        isActive: false,
      },
    });

    await db.transaction.create({
      data: {
        userId: user.sub,
        type: 'PROMOTION',
        amount,
        currency: 'XOF',
        status: 'PENDING',
        paymentMethod: 'MOBILE_MONEY',
        paymentProvider: 'CINETPAY',
        productId: ad.id,
        metadata: JSON.stringify({ placement, duration, days }),
      },
    });

    return NextResponse.json({ ad, amount, currency: 'XOF' });
  } catch (error) {
    console.error('Promote POST error:', error);
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const ads = await db.ad.findMany({
      where: { userId: user.sub },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ ads, prices: PROMO_PRICES });
  } catch (error) {
    console.error('Promote GET error:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement' }, { status: 500 });
  }
}

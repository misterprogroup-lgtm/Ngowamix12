import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
    }

    const { code, amount } = await request.json();
    if (!code || !amount) {
      return NextResponse.json({ error: 'Code et montant requis' }, { status: 400 });
    }

    const promo = await db.promoCode.findUnique({ where: { code: code.toUpperCase() } });
    if (!promo || !promo.isActive) {
      return NextResponse.json({ error: 'Code promo invalide' }, { status: 400 });
    }

    if (promo.maxUses > 0 && promo.currentUses >= promo.maxUses) {
      return NextResponse.json({ error: 'Ce code a atteint sa limite d\'utilisations' }, { status: 400 });
    }

    if (promo.expiresAt && new Date() > promo.expiresAt) {
      return NextResponse.json({ error: 'Ce code a expiré' }, { status: 400 });
    }

    if (amount < promo.minAmount) {
      return NextResponse.json({ error: `Montant minimum : ${promo.minAmount} XOF` }, { status: 400 });
    }

    let discount = promo.discountType === 'PERCENTAGE'
      ? Math.floor(amount * promo.discountValue / 100)
      : promo.discountValue;

    if (promo.maxAmount && discount > promo.maxAmount) {
      discount = promo.maxAmount;
    }

    return NextResponse.json({
      valid: true,
      discount,
      promoCodeId: promo.id,
      code: promo.code,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

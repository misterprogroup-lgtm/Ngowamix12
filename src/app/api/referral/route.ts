import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import crypto from 'crypto';

function generateCode(userId: string): string {
  const hash = crypto.createHash('sha256').update(userId).digest('hex').substring(0, 6).toUpperCase();
  return `NGW${hash}`;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
    }

    let referral = await db.referralCode.findUnique({ where: { userId: user.sub } });
    if (!referral) {
      referral = await db.referralCode.create({
        data: {
          code: generateCode(user.sub),
          userId: user.sub,
        },
      });
    }

    const usageCount = await db.usedPromoCode.count({
      where: { referralCodeId: referral.id },
    });

    return NextResponse.json({ ...referral, usageCount });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code invalide' }, { status: 400 });
    }

    const referral = await db.referralCode.findUnique({ where: { code: code.toUpperCase() } });
    if (!referral) {
      return NextResponse.json({ error: 'Code de parrainage invalide' }, { status: 400 });
    }

    if (referral.userId === user.sub) {
      return NextResponse.json({ error: 'Vous ne pouvez pas utiliser votre propre code' }, { status: 400 });
    }

    if (referral.maxUses > 0 && referral.currentUses >= referral.maxUses) {
      return NextResponse.json({ error: 'Ce code a atteint sa limite d\'utilisations' }, { status: 400 });
    }

    if (referral.expiresAt && new Date() > referral.expiresAt) {
      return NextResponse.json({ error: 'Ce code a expiré' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      discountPercent: referral.discountPercent,
      referralCodeId: referral.id,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

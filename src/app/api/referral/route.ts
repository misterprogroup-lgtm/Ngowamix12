import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import crypto from 'crypto';
import { z } from 'zod';

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

    let commissions: any[] = [];
    let totalCommissions = 0;
    if (user.role === 'ARTIST' || user.role === 'LABEL' || user.role === 'ADMIN') {
      const artist = await db.artist.findUnique({ where: { userId: user.sub } });
      if (artist) {
        commissions = await db.commission.findMany({
          where: { artistId: artist.id, status: 'PAID' },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });
        totalCommissions = commissions.reduce((s, c) => s + c.commissionAmount, 0);
      }
    }

    return NextResponse.json({ ...referral, usageCount, totalCommissions, recentCommissions: commissions });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

const updateSchema = z.object({
  code: z.string().min(3).max(20).transform(s => s.toUpperCase()),
});

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = updateSchema.parse(body);

    const existing = await db.referralCode.findUnique({ where: { code } });
    if (existing && existing.userId !== user.sub) {
      return NextResponse.json({ error: 'Ce code est déjà utilisé' }, { status: 400 });
    }

    const referral = await db.referralCode.upsert({
      where: { userId: user.sub },
      update: { code },
      create: { code, userId: user.sub },
    });

    return NextResponse.json(referral);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
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

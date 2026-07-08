import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, hashToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateVerificationCode, sendVerificationCode } from '@/lib/sms';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = checkRateLimit(`send-verification:${ip}`, { maxRequests: 3, windowMs: 60000 });
    if (!allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez plus tard.' },
        { status: 429 }
      );
    }

    const user = await requireAuth();

    const userData = await db.user.findUnique({
      where: { id: user.sub },
      select: { phone: true },
    });

    if (!userData?.phone) {
      return NextResponse.json(
        { error: 'Aucun numéro de téléphone associé' },
        { status: 400 }
      );
    }

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const hashedCode = await hashToken(code);

    await db.user.update({
      where: { id: user.sub },
      data: {
        phoneVerificationCode: hashedCode,
        phoneVerificationExpiresAt: expiresAt,
      },
    });

    const sent = await sendVerificationCode(userData.phone, code);

    if (!sent) {
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi du code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Code de vérification envoyé',
    });
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du code' },
      { status: 500 }
    );
  }
}

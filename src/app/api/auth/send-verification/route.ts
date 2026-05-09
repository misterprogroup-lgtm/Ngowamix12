import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { generateVerificationCode, sendVerificationCode } from '@/lib/sms';

export async function POST() {
  try {
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

    await db.user.update({
      where: { id: user.sub },
      data: {
        phoneVerificationCode: code,
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

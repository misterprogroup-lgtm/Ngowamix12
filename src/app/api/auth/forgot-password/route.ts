import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail, generateResetEmail } from '@/lib/email';
import { hashToken } from '@/lib/auth';
import { APP_BASE_URL } from '@/lib/constants';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = await checkRateLimit(`forgot-password:${ip}`, { maxRequests: 3, windowMs: 60000 });
    if (!allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez plus tard.' },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' }
      );
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await hashToken(resetToken);
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await db.user.update({
      where: { id: user.id },
      data: { resetToken: hashedToken, resetTokenExpiry },
    });

    const resetLink = `${APP_BASE_URL}/reset-password?token=${resetToken}`;
    const name = user.firstName || user.displayName || user.email;

    const sent = await sendEmail(
      user.email,
      generateResetEmail(name, resetLink).subject,
      generateResetEmail(name, resetLink).html
    );

    if (!sent) {
      console.error('Email sending failed');
    }

    return NextResponse.json({
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation du mot de passe' },
      { status: 500 }
    );
  }
}

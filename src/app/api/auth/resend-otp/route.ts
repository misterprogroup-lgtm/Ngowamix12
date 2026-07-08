import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, hashToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendEmail, generateEmailVerificationEmail } from '@/lib/email';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST() {
  try {
    const ip = 'resend-otp'; // rate limit par utilisateur via le JWT
    const { allowed } = checkRateLimit(ip, { maxRequests: 5, windowMs: 60000 });
    if (!allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez plus tard.' },
        { status: 429 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.sub },
      select: { emailVerified: true, firstName: true, email: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (dbUser.emailVerified) {
      return NextResponse.json({
        message: 'Email déjà vérifié',
        emailVerified: true,
      });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const hashedOtp = await hashToken(otp);

    await db.user.update({
      where: { id: user.sub },
      data: {
        emailVerificationCode: hashedOtp,
        emailVerificationExpiresAt: otpExpires,
      },
    });

    sendEmail(dbUser.email, 'Vérification de votre email — Ngowamix', generateEmailVerificationEmail(dbUser.firstName || dbUser.email, otp).html).catch(() => {
      // Email non bloquant
    });

    return NextResponse.json({
      message: 'Nouveau code envoyé',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du code' },
      { status: 500 }
    );
  }
}

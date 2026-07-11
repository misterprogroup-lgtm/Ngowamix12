import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, verifyTokenHash } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = await checkRateLimit(`reset-password:${ip}`, { maxRequests: 3, windowMs: 60000 });
    if (!allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez plus tard.' },
        { status: 429 }
      );
    }

    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token et mot de passe requis' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    const candidates = await db.user.findMany({
      where: { resetToken: { not: null }, resetTokenExpiry: { gt: new Date() } },
      select: { id: true, resetToken: true, resetTokenExpiry: true },
    });

    let matchedUser: { id: string } | null = null;
    for (const candidate of candidates) {
      if (candidate.resetToken && await verifyTokenHash(token, candidate.resetToken)) {
        matchedUser = candidate;
        break;
      }
    }

    if (!matchedUser) {
      return NextResponse.json(
        { error: 'Le lien de réinitialisation est invalide ou a expiré.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    await db.user.update({
      where: { id: matchedUser.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({
      message: 'Mot de passe réinitialisé avec succès.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail, generateResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
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
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await db.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    const name = user.firstName || user.displayName || user.email;

    await sendEmail(
      user.email,
      generateResetEmail(name, resetLink).subject,
      generateResetEmail(name, resetLink).html
    );

    return NextResponse.json({
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du lien' },
      { status: 500 }
    );
  }
}

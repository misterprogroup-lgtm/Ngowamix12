import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const verifySchema = z.object({
  code: z.string().length(6, 'Le code doit contenir 6 chiffres'),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = verifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { code } = result.data;

    const dbUser = await db.user.findUnique({
      where: { id: user.sub },
      select: {
        emailVerified: true,
        emailVerificationCode: true,
        emailVerificationExpiresAt: true,
      },
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

    if (!dbUser.emailVerificationCode || !dbUser.emailVerificationExpiresAt) {
      return NextResponse.json(
        { error: 'Aucun code de vérification trouvé. Veuillez demander un nouveau code.' },
        { status: 400 }
      );
    }

    if (new Date() > dbUser.emailVerificationExpiresAt) {
      return NextResponse.json(
        { error: 'Code expiré. Veuillez demander un nouveau code.' },
        { status: 400 }
      );
    }

    if (dbUser.emailVerificationCode !== code) {
      return NextResponse.json(
        { error: 'Code incorrect' },
        { status: 400 }
      );
    }

    await db.user.update({
      where: { id: user.sub },
      data: {
        emailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpiresAt: null,
      },
    });

    return NextResponse.json({
      message: 'Email vérifié avec succès',
      emailVerified: true,
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}

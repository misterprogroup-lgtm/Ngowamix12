import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const verifySchema = z.object({
  code: z.string().length(6, 'Le code doit contenir 6 chiffres'),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const result = verifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { code } = result.data;

    const userData = await db.user.findUnique({
      where: { id: user.sub },
      select: {
        phoneVerificationCode: true,
        phoneVerificationExpiresAt: true,
        phoneVerified: true,
      },
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (userData.phoneVerified) {
      return NextResponse.json({
        message: 'Numéro déjà vérifié',
        verified: true,
      });
    }

    if (!userData.phoneVerificationCode || !userData.phoneVerificationExpiresAt) {
      return NextResponse.json(
        { error: 'Aucun code de vérification demandé. Veuillez demander un nouveau code.' },
        { status: 400 }
      );
    }

    if (new Date() > userData.phoneVerificationExpiresAt) {
      return NextResponse.json(
        { error: 'Le code a expiré. Veuillez demander un nouveau code.' },
        { status: 400 }
      );
    }

    if (userData.phoneVerificationCode !== code) {
      return NextResponse.json(
        { error: 'Code incorrect' },
        { status: 400 }
      );
    }

    await db.user.update({
      where: { id: user.sub },
      data: {
        phoneVerified: true,
        phoneVerificationCode: null,
        phoneVerificationExpiresAt: null,
      },
    });

    return NextResponse.json({
      message: 'Numéro de téléphone vérifié avec succès',
      verified: true,
    });
  } catch (error) {
    console.error('Verify phone error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}

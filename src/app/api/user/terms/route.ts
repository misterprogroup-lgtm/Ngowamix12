import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);

    const existing = await db.user.findUnique({
      where: { id: user.sub },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Session invalide, veuillez vous reconnecter' },
        { status: 401 }
      );
    }

    await db.user.update({
      where: { id: user.sub },
      data: {
        termsAccepted: true,
        termsAcceptedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    console.error('Accept terms error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'acceptation des conditions' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);

    const userData = await db.user.findUnique({
      where: { id: user.sub },
      select: { termsAccepted: true, termsAcceptedAt: true },
    });

    return NextResponse.json({
      termsAccepted: userData?.termsAccepted ?? false,
      termsAcceptedAt: userData?.termsAcceptedAt,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    console.error('Get terms status error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des conditions' },
      { status: 500 }
    );
  }
}

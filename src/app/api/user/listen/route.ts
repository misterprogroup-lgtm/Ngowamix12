import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { trackId } = await request.json();
    if (!trackId) {
      return NextResponse.json({ error: 'trackId requis' }, { status: 400 });
    }

    await db.listenHistory.create({
      data: {
        userId: session.sub,
        trackId,
      },
    });

    await db.track.update({
      where: { id: trackId },
      data: { playCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

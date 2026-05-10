import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { endpoint, p256dh, auth, userAgent } = await request.json();

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: 'Données incomplètes' }, { status: 400 });
    }

    const existing = await db.pushSubscription.findUnique({
      where: { endpoint },
    });

    if (existing) {
      const sub = await db.pushSubscription.update({
        where: { endpoint },
        data: { p256dh, auth, userAgent },
      });
      return NextResponse.json({ success: true, subscription: sub });
    }

    const sub = await db.pushSubscription.create({
      data: {
        userId: session.sub,
        endpoint,
        p256dh,
        auth,
        userAgent: userAgent || null,
      },
    });

    return NextResponse.json({ success: true, subscription: sub });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { endpoint } = await request.json();
    if (!endpoint) {
      return NextResponse.json({ error: 'endpoint requis' }, { status: 400 });
    }

    await db.pushSubscription.deleteMany({
      where: { endpoint, userId: session.sub },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

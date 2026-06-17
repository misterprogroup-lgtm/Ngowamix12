import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const notifications = await db.notification.findMany({
      where: { userId: session.sub },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unreadCount = notifications.filter((n) => n.status === 'UNREAD').length;

    return NextResponse.json({ notifications, unreadCount });
  } catch {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { action, id } = body;

    if (action === 'mark-all-read') {
      await db.notification.updateMany({
        where: { userId: session.sub, status: 'UNREAD' },
        data: { status: 'READ' },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'mark-read' && id) {
      await db.notification.updateMany({
        where: { id, userId: session.sub },
        data: { status: 'READ' },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

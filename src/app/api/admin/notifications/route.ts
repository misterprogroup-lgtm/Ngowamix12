import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    await requireRole(['ADMIN']);

    const notifications = await db.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await db.notification.count({
      where: { status: 'UNREAD' },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole(['ADMIN']);

    const body = await request.json();
    const { id, action } = body;

    if (action === 'mark-all-read') {
      await db.notification.updateMany({
        where: { status: 'UNREAD' },
        data: { status: 'READ' },
      });
      return NextResponse.json({ success: true });
    }

    if (id && action === 'mark-read') {
      await db.notification.update({
        where: { id },
        data: { status: 'READ' },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    console.error('Update notification error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des notifications' },
      { status: 500 }
    );
  }
}

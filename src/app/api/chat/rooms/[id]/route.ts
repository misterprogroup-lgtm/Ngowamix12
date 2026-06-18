import { NextResponse } from 'next/server';
import { getChatRoomById, joinRoom, leaveRoom } from '@/lib/chat';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const room = await getChatRoomById(id);
    if (!room) return NextResponse.json({ error: 'Salon introuvable' }, { status: 404 });
    return NextResponse.json({ room });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
    const { id } = await params;
    const { action } = await request.json();

    if (action === 'join') {
      await joinRoom(id, user.sub);
      return NextResponse.json({ success: true });
    }
    if (action === 'leave') {
      await leaveRoom(id, user.sub);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const { id } = await params;
    const room = await db.chatRoom.findUnique({ where: { id } });
    if (!room) return NextResponse.json({ error: 'Salon introuvable' }, { status: 404 });

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    await db.chatRoom.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

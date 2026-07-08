import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

  const conversations = await db.conversation.findMany({
    where: {
      OR: [{ user1Id: user.sub }, { user2Id: user.sub }],
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      user1: { select: { id: true, displayName: true, avatar: true } },
      user2: { select: { id: true, displayName: true, avatar: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: { select: { id: true, displayName: true } },
        },
      },
    },
  });

  return NextResponse.json({ conversations });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

  const { userId: otherUserId } = await req.json();
  if (!otherUserId) {
    return NextResponse.json({ error: 'userId requis' }, { status: 400 });
  }
  if (otherUserId === user.sub) {
    return NextResponse.json({ error: 'Vous ne pouvez pas vous envoyer un message' }, { status: 400 });
  }

  const user1Id = user.sub < otherUserId ? user.sub : otherUserId;
  const user2Id = user.sub < otherUserId ? otherUserId : user.sub;

  const existing = await db.conversation.findUnique({
    where: { user1Id_user2Id: { user1Id, user2Id } },
  });

  if (existing) return NextResponse.json({ conversation: existing });

  const conversation = await db.conversation.create({
    data: { user1Id, user2Id },
  });

  return NextResponse.json({ conversation });
}

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

  const { id } = await params;

  const conversation = await db.conversation.findFirst({
    where: {
      id,
      OR: [{ user1Id: user.sub }, { user2Id: user.sub }],
    },
  });
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 });
  }

  const messages = await db.directMessage.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, displayName: true, avatar: true } },
    },
  });

  return NextResponse.json(messages);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

  const { id } = await params;

  const conversation = await db.conversation.findFirst({
    where: {
      id,
      OR: [{ user1Id: user.sub }, { user2Id: user.sub }],
    },
  });
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 });
  }

  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: 'Message vide' }, { status: 400 });
  }

  const [message] = await db.$transaction([
    db.directMessage.create({
      data: {
        conversationId: id,
        senderId: user.sub,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, displayName: true, avatar: true } },
      },
    }),
    db.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    }),
  ]);

  const otherUserId = conversation.user1Id === user.sub ? conversation.user2Id : conversation.user1Id;

  const sender = await db.user.findUnique({
    where: { id: user.sub },
    select: { displayName: true },
  });

  await db.notification.create({
    data: {
      userId: otherUserId,
      type: 'DIRECT_MESSAGE',
      title: 'Nouveau message',
      message: `${sender?.displayName || 'Quelqu\'un'}: ${content.trim().slice(0, 100)}`,
      referenceId: conversation.id,
      referenceType: 'conversation',
    },
  });

  return NextResponse.json(message);
}

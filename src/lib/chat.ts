import { db } from './db';

export async function getChatRooms(userId?: string) {
  const where: Record<string, unknown> = { isActive: true };
  if (userId) {
    where.OR = [
      { type: 'GLOBAL' },
      { participants: { some: { userId } } },
    ];
  }
  return db.chatRoom.findMany({
    where,
    include: {
      _count: { select: { messages: true, participants: true } },
      artist: { select: { id: true, name: true, slug: true, avatar: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getChatRoomById(id: string) {
  return db.chatRoom.findUnique({
    where: { id },
    include: {
      artist: { select: { id: true, name: true, slug: true, avatar: true } },
      album: { select: { id: true, title: true, coverImage: true } },
      _count: { select: { messages: true, participants: true } },
    },
  });
}

export async function createChatRoom(data: {
  type: 'GLOBAL' | 'ARTIST' | 'ALBUM';
  name: string;
  slug: string;
  image?: string;
  artistId?: string;
  albumId?: string;
}) {
  return db.chatRoom.create({ data });
}

export async function getOrCreateGlobalChat(): Promise<{ id: string }> {
  let room = await db.chatRoom.findFirst({ where: { type: 'GLOBAL', isActive: true } });
  if (!room) {
    room = await db.chatRoom.create({
      data: { type: 'GLOBAL', name: 'Général', slug: 'general' },
    });
  }
  return room;
}

export async function getMessages(roomId: string, limit = 50, before?: string) {
  const where: Record<string, unknown> = { roomId };
  if (before) {
    where.createdAt = { lt: new Date(before) };
  }
  return db.chatMessage.findMany({
    where,
    include: {
      user: { select: { id: true, displayName: true, avatar: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function sendMessage(roomId: string, userId: string, content: string) {
  const [message] = await db.$transaction([
    db.chatMessage.create({
      data: { roomId, userId, content },
      include: {
        user: { select: { id: true, displayName: true, avatar: true, role: true } },
      },
    }),
    db.chatRoom.update({ where: { id: roomId }, data: { updatedAt: new Date() } }),
    db.chatParticipant.upsert({
      where: { roomId_userId: { roomId, userId } },
      update: { lastReadAt: new Date() },
      create: { roomId, userId },
    }),
  ]);
  return message;
}

export async function joinRoom(roomId: string, userId: string) {
  return db.chatParticipant.upsert({
    where: { roomId_userId: { roomId, userId } },
    update: {},
    create: { roomId, userId },
  });
}

export async function leaveRoom(roomId: string, userId: string) {
  return db.chatParticipant.deleteMany({
    where: { roomId, userId },
  });
}

export async function getRoomParticipants(roomId: string) {
  return db.chatParticipant.findMany({
    where: { roomId },
    include: {
      user: { select: { id: true, displayName: true, avatar: true } },
    },
    orderBy: { joinedAt: 'desc' },
  });
}

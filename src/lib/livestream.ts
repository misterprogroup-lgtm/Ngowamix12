import { db } from './db';
import crypto from 'crypto';

export function generateStreamKey(): string {
  return `ngw_live_${crypto.randomBytes(16).toString('hex')}`;
}

export async function getActiveLivestreams(limit = 20, offset = 0) {
  const [streams, total] = await Promise.all([
    db.liveStream.findMany({
      where: { status: 'LIVE' },
      include: {
        artist: { select: { id: true, name: true, slug: true, avatar: true } },
        _count: { select: { chats: true } },
      },
      orderBy: { viewerCount: 'desc' },
      take: limit,
      skip: offset,
    }),
    db.liveStream.count({ where: { status: 'LIVE' } }),
  ]);
  return { streams, total };
}

export async function getLivestreamById(id: string) {
  return db.liveStream.findUnique({
    where: { id },
    include: {
      artist: { select: { id: true, name: true, slug: true, avatar: true, userId: true, streamServerUrl: true } },
      _count: { select: { chats: true } },
    },
  });
}

export async function createLivestream(data: {
  artistId: string;
  title: string;
  description?: string;
  thumbnail?: string;
  streamUrl?: string;
  streamKey?: string;
  scheduledAt?: string;
}) {
  return db.liveStream.create({
    data: {
      artistId: data.artistId,
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail,
      streamUrl: data.streamUrl,
      streamKey: data.streamKey || generateStreamKey(),
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    },
  });
}

export async function updateLivestreamStatus(id: string, status: 'LIVE' | 'ENDED' | 'SCHEDULED') {
  const updateData: Record<string, unknown> = { status };
  if (status === 'LIVE') updateData.startedAt = new Date();
  if (status === 'ENDED') updateData.endedAt = new Date();
  return db.liveStream.update({ where: { id }, data: updateData as any });
}

export async function incrementViewerCount(id: string) {
  return db.liveStream.update({
    where: { id },
    data: { viewerCount: { increment: 1 } },
  });
}

export async function decrementViewerCount(id: string) {
  return db.liveStream.update({
    where: { id, viewerCount: { gt: 0 } },
    data: { viewerCount: { decrement: 1 } },
  });
}

export async function getChatMessages(liveStreamId: string, limit = 50, before?: string) {
  const where: Record<string, unknown> = { liveStreamId };
  if (before) {
    where.createdAt = { lt: new Date(before) };
  }
  return db.liveStreamChat.findMany({
    where,
    include: {
      user: { select: { id: true, displayName: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function sendChatMessage(liveStreamId: string, userId: string, message: string) {
  return db.liveStreamChat.create({
    data: { liveStreamId, userId, message },
    include: {
      user: { select: { id: true, displayName: true, avatar: true } },
    },
  });
}

export async function trackViewerJoin(liveStreamId: string, userId: string) {
  await db.liveStreamView.upsert({
    where: { liveStreamId_userId: { liveStreamId, userId } },
    update: { leftAt: null },
    create: { liveStreamId, userId },
  });
  await incrementViewerCount(liveStreamId);
}

export async function trackViewerLeave(liveStreamId: string, userId: string) {
  await db.liveStreamView.updateMany({
    where: { liveStreamId, userId, leftAt: null },
    data: { leftAt: new Date() },
  });
  await decrementViewerCount(liveStreamId);
}

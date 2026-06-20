import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

  const { trackId, albumId } = await req.json();
  if (!trackId && !albumId) {
    return NextResponse.json({ error: 'trackId ou albumId requis' }, { status: 400 });
  }

  const existing = await db.repost.findFirst({
    where: {
      userId: user.sub,
      ...(trackId ? { trackId } : { albumId }),
    },
  });

  if (existing) {
    await db.repost.delete({ where: { id: existing.id } });
    return NextResponse.json({ reposted: false });
  }

  await db.repost.create({
    data: {
      userId: user.sub,
      ...(trackId ? { trackId } : { albumId }),
    },
  });

  await db.activity.create({
    data: {
      userId: user.sub,
      type: trackId ? 'REPOST_TRACK' : 'REPOST_ALBUM',
      trackId: trackId || null,
      albumId: albumId || null,
    },
  });

  return NextResponse.json({ reposted: true });
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const trackId = searchParams.get('trackId');
  const albumId = searchParams.get('albumId');

  if (!trackId && !albumId) {
    return NextResponse.json({ error: 'trackId ou albumId requis' }, { status: 400 });
  }

  const repost = await db.repost.findFirst({
    where: {
      userId: user.sub,
      ...(trackId ? { trackId } : { albumId }),
    },
  });

  const count = await db.repost.count({
    where: {
      ...(trackId ? { trackId } : { albumId }),
    },
  });

  return NextResponse.json({ reposted: !!repost, count });
}

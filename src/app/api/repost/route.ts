import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = await checkRateLimit(`repost:${ip}`, { maxRequests: 10, windowMs: 60000 });
    if (!allowed) return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });

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
  } catch (error) {
    console.error('Repost error:', error);
    return NextResponse.json({ error: 'Erreur lors du repost' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
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
  } catch (error) {
    console.error('Repost GET error:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement' }, { status: 500 });
  }
}

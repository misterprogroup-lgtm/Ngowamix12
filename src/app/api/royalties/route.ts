import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getArtistEarnings, getArtistStreamHistory, getTopEarningArtists, recordStreamPlay } from '@/lib/royalties';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'my-earnings';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

    if (type === 'top') {
      const artists = await getTopEarningArtists(limit);
      return NextResponse.json({ artists });
    }

    if (type === 'my-earnings' || type === 'history') {
      const artist = await db.artist.findUnique({ where: { userId: user.sub } });
      if (!artist) return NextResponse.json({ error: 'Vous devez être un artiste' }, { status: 403 });

      if (type === 'my-earnings') {
        const earnings = await getArtistEarnings(artist.id);
        return NextResponse.json(earnings);
      }

      const { plays, total } = await getArtistStreamHistory(artist.id, limit, (page - 1) * limit);
      return NextResponse.json({
        plays,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    }

    return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { trackId, artistId } = body;

    if (!trackId || !artistId) {
      return NextResponse.json({ error: 'trackId et artistId requis' }, { status: 400 });
    }

    const play = await recordStreamPlay(trackId, user?.sub || null, artistId);

    await db.track.update({
      where: { id: trackId },
      data: { playCount: { increment: 1 } },
    });

    return NextResponse.json({ play }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

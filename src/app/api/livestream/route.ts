import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getActiveLivestreams, createLivestream } from '@/lib/livestream';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

    const { streams, total } = await getActiveLivestreams(limit, (page - 1) * limit);
    return NextResponse.json({
      streams,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ streams: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const artist = await db.artist.findUnique({ where: { userId: user.sub } });
    if (!artist) return NextResponse.json({ error: 'Vous devez être un artiste' }, { status: 403 });

    const body = await request.json();
    const { title, description, thumbnail, scheduledAt } = body;

    if (!title) return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 });

    const stream = await createLivestream({
      artistId: artist.id,
      title,
      description,
      thumbnail,
      scheduledAt,
    });

    return NextResponse.json({ stream }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const artist = await db.artist.findUnique({ where: { userId: user.sub } });
    if (!artist) return NextResponse.json({ streams: [] });

    const streams = await db.liveStream.findMany({
      where: { artistId: artist.id },
      include: {
        _count: { select: { chats: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ streams });
  } catch {
    return NextResponse.json({ streams: [] });
  }
}

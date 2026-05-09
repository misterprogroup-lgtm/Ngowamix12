import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ tracks: [] });
    }

    const history = await db.listenHistory.findMany({
      where: { userId: session.sub },
      orderBy: { playedAt: 'desc' },
      take: 200,
      include: {
        track: {
          include: {
            album: {
              include: {
                artist: true,
              },
            },
          },
        },
      },
    });

    const seen = new Set<string>();
    const tracks: typeof history[0]['track'][] = [];
    for (const entry of history) {
      if (!seen.has(entry.trackId)) {
        seen.add(entry.trackId);
        tracks.push(entry.track);
      }
    }

    return NextResponse.json({ tracks });
  } catch {
    return NextResponse.json({ tracks: [] });
  }
}

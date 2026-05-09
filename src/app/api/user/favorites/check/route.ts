import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ favoriteIds: [] });
    }

    const { searchParams } = new URL(request.url);
    const trackIds = searchParams.get('ids');

    if (!trackIds) {
      return NextResponse.json({ favoriteIds: [] });
    }

    const ids = trackIds.split(',');

    const favorites = await db.favorite.findMany({
      where: {
        userId: session.sub,
        trackId: { in: ids },
      },
      select: { trackId: true },
    });

    const favoriteIds = favorites.map((f) => f.trackId).filter(Boolean) as string[];

    return NextResponse.json({ favoriteIds });
  } catch {
    return NextResponse.json({ favoriteIds: [] });
  }
}

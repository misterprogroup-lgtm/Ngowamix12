import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRecommendations, getArtistRecommendations } from '@/lib/recommendations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'tracks';
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

    const session = await getCurrentUser();
    const userId = session?.sub || null;

    if (type === 'artists') {
      const artists = await getArtistRecommendations(userId, limit);
      return NextResponse.json({ artists });
    }

    const tracks = await getRecommendations(userId, limit);
    return NextResponse.json({ tracks });
  } catch {
    return NextResponse.json({ tracks: [], artists: [] });
  }
}

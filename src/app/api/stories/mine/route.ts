import { NextResponse } from 'next/server';
import { getDownloadUrl } from '@vercel/blob';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();

    const artist = await db.artist.findUnique({ where: { userId: user.sub } });
    if (!artist) {
      return NextResponse.json({ error: 'Artiste non trouvé' }, { status: 403 });
    }

    const stories = await db.story.findMany({
      where: { artistId: artist.id },
      include: {
        _count: { select: { views: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const storiesWithSignedUrls = stories.map((story) => ({
      ...story,
      mediaUrl: getDownloadUrl(story.mediaUrl),
    }));

    return NextResponse.json({ stories: storiesWithSignedUrls });
  } catch {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
}

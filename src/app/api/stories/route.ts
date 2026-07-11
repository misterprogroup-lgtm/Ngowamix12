import { NextResponse } from 'next/server';
import { issueSignedToken, presignUrl } from '@vercel/blob';
import type { IssuedSignedToken } from '@vercel/blob';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

function getBlobPathname(blobUrl: string): string | null {
  try {
    const url = new URL(blobUrl);
    if (!url.hostname.includes('public.blob.vercel-storage.com')) return null;
    return url.pathname.slice(1);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    const now = new Date();
    const stories = await db.story.findMany({
      where: { expiresAt: { gt: now } },
      include: {
        artist: {
          select: { id: true, name: true, slug: true, avatar: true, isVerified: true },
        },
        views: user
          ? { where: { userId: user.sub }, take: 1 }
          : false,
        likes: user
          ? { where: { userId: user.sub }, take: 1 }
          : false,
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    let token: Pick<IssuedSignedToken, 'clientSigningToken' | 'delegationToken'> | null = null;
    try {
      const issued = await issueSignedToken({
        pathname: 'stories/',
        operations: ['get'],
        validUntil: Date.now() + 3600_000,
      });
      token = { clientSigningToken: issued.clientSigningToken, delegationToken: issued.delegationToken };
    } catch (e) {
      console.error('issueSignedToken failed:', e);
    }

    const storiesWithSignedUrls = await Promise.all(
      stories.map(async (story) => {
        let mediaUrl = story.mediaUrl;
        const pathname = getBlobPathname(story.mediaUrl);
        if (pathname && token) {
          try {
            const { presignedUrl } = await presignUrl(token, {
              operation: 'get',
              pathname,
              access: 'private',
            });
            mediaUrl = presignedUrl;
          } catch (e) {
            console.error('presignUrl failed for', pathname, e);
          }
        }
        const { _count, likes, ...rest } = story;
        return {
          ...rest,
          mediaUrl,
          likesCount: _count.likes,
          isLiked: likes ? likes.length > 0 : false,
        };
      })
    );

    const grouped: Record<string, { artist: typeof stories[0]['artist']; stories: typeof storiesWithSignedUrls; allViewed: boolean }> = {};
    for (const story of storiesWithSignedUrls) {
      const key = story.artistId;
      if (!grouped[key]) {
        grouped[key] = {
          artist: story.artist,
          stories: [],
          allViewed: true,
        };
      }
      grouped[key].stories.push(story);
      if (user && story.views.length === 0) {
        grouped[key].allViewed = false;
      }
    }

    return NextResponse.json({ groups: Object.values(grouped) });
  } catch {
    return NextResponse.json({ groups: [] });
  }
}

export async function POST(request: Request) {
  try {
    const { requireAuth } = await import('@/lib/auth');
    const user = await requireAuth(request);

    const artist = await db.artist.findUnique({ where: { userId: user.sub } });
    if (!artist) {
      return NextResponse.json({ error: 'Artiste non trouvé' }, { status: 403 });
    }

    const { mediaUrl, mediaType, caption, pathname: blobPathname } = await request.json();
    if (!mediaUrl) {
      return NextResponse.json({ error: 'mediaUrl requis' }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = await db.story.create({
      data: {
        artistId: artist.id,
        mediaUrl,
        blobPathname: blobPathname || null,
        mediaType: mediaType || 'IMAGE',
        caption: caption || null,
        expiresAt,
      },
    });

    return NextResponse.json({ story });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}

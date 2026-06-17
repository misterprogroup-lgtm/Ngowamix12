import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.APP_URL || 'https://ngowamix.com';

  try {
    const [albums, artists, concerts, podcasts, tracks] = await Promise.all([
      db.album.findMany({ where: { status: 'PUBLISHED' }, select: { id: true, updatedAt: true } }),
      db.artist.findMany({ select: { slug: true, updatedAt: true } }),
      db.concert.findMany({ select: { id: true, updatedAt: true } }),
      db.podcast.findMany({ select: { id: true, updatedAt: true } }),
      db.track.findMany({ select: { id: true, updatedAt: true } }),
    ]);

    const staticPages = [
      '/', '/explore', '/premium', '/about', '/contact', '/help',
      '/terms', '/privacy', '/copyright', '/podcasts', '/tickets',
    ];

    const albumUrls = albums.map((a) => ({
      url: `${appUrl}/album/${a.id}`,
      lastModified: a.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }));

    const artistUrls = artists.map((a) => ({
      url: `${appUrl}/artist/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const concertUrls = concerts.map((c) => ({
      url: `${appUrl}/tickets/${c.id}`,
      lastModified: c.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.5,
    }));

    const podcastUrls = podcasts.map((p) => ({
      url: `${appUrl}/podcasts/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

    const staticUrls = staticPages.map((page) => ({
      url: `${appUrl}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const trackUrls = tracks.map((t) => ({
      url: `${appUrl}/track/${t.id}`,
      lastModified: t.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    }));

    return [...staticUrls, ...albumUrls, ...artistUrls, ...concertUrls, ...podcastUrls, ...trackUrls];
  } catch (err) {
    console.error('[SITEMAP] Error generating sitemap:', err);
    return [];
  }
}

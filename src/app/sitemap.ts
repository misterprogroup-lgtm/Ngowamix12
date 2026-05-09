import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.APP_URL || 'https://ngowamix.com';

  try {
    const [albums, artists] = await Promise.all([
      db.album.findMany({ where: { status: 'PUBLISHED' }, select: { id: true, updatedAt: true } }),
      db.artist.findMany({ select: { slug: true, updatedAt: true } }),
    ]);

    const staticPages = ['/', '/explore', '/premium', '/about', '/contact', '/help', '/terms', '/privacy'];

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

    const staticUrls = staticPages.map((page) => ({
      url: `${appUrl}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticUrls, ...albumUrls, ...artistUrls];
  } catch {
    return [];
  }
}

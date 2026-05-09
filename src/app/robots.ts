import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.APP_URL || 'https://ngowamix.com';
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/api/', '/user/', '/admin/'] },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}

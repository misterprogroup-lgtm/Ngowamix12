import type { Metadata } from 'next';
import { Suspense } from 'react';
import { db } from '@/lib/db';
import { APP_NAME, PREMIUM_PRICE, PREMIUM_CURRENCY } from '@/lib/constants';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { GenreFilter } from '@/components/home/genre-filter';
import { ArtistCTA } from '@/components/home/artist-cta';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `${APP_NAME} - Streaming musical africain gratuit`,
  description: `Écoutez et découvrez la musique africaine francophone. Streaming gratuit, abonnement Premium à ${PREMIUM_PRICE} ${PREMIUM_CURRENCY}/mois et achat d'albums.`,
  alternates: { canonical: '/' },
  openGraph: {
    title: `${APP_NAME} - Streaming musical africain gratuit`,
    description: 'Écoutez et découvrez la musique africaine francophone. Streaming gratuit, abonnement Premium et achat d\'albums.',
    url: '/',
    siteName: APP_NAME,
    type: 'website',
    locale: 'fr_FR',
    images: [{ url: '/og.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} - Streaming musical africain gratuit`,
    description: 'Écoutez et découvrez la musique africaine francophone.',
    images: ['/og.jpg'],
  },
};

async function getPopularTracks() {
  try {
    return await db.track.findMany({
      orderBy: { playCount: 'desc' },
      take: 50,
      include: {
        album: {
          include: { artist: true },
        },
      },
    });
  } catch {
    return [];
  }
}

async function getTrendingAlbums() {
  try {
    const albums = await db.album.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { playCount: 'desc' },
      take: 10,
      include: { artist: true },
    });
    return albums.map((a) => ({
      id: a.id,
      cover: a.coverImage,
      artist: a.artist.name,
      title: a.title,
      genre: a.genre,
    }));
  } catch {
    return [];
  }
}

async function getFeaturedArtists() {
  try {
    const artists = await db.artist.findMany({
      take: 6,
      include: {
        user: true,
        _count: { select: { favorites: true } },
      },
    });
    return artists.map((a) => ({
      id: a.id,
      avatar: a.avatar,
      name: a.name,
      slug: a.slug,
      followers: a._count.favorites.toString(),
      isVerified: a.isVerified,
    }));
  } catch {
    return [];
  }
}

async function getRecentTracks() {
  try {
    const tracks = await db.track.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        album: {
          include: { artist: true },
        },
      },
    });
    return tracks.map((t) => ({
      id: t.id,
      cover: t.album?.coverImage,
      artist: t.album?.artist?.name || 'Artiste',
      title: t.title,
      genre: t.album?.genre,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [popularTracks, trendingAlbums, featuredArtists, recentTracks] = await Promise.all([
    getPopularTracks(),
    getTrendingAlbums(),
    getFeaturedArtists(),
    getRecentTracks(),
  ]);

  const trendingSongItems = popularTracks.map((t) => ({
    id: t.id,
    title: t.title,
    artist: t.album?.artist?.name || 'Artiste',
    artistImage: t.album?.artist?.avatar || null,
    cover: t.album?.coverImage || null,
    plays: t.playCount,
    genre: t.album?.genre,
  }));

  return (
    <div className="pb-8">
      <h1 className="sr-only">{APP_NAME} - Streaming musical africain</h1>

      <div className="mx-4 md:mx-8 pt-4 mb-8">
        <HeroCarousel />
      </div>

      <GenreFilter
        tracks={trendingSongItems}
        albums={trendingAlbums}
        accounts={featuredArtists}
        recent={recentTracks}
      />

      <Suspense fallback={<div className="mx-4 md:mx-8 mb-8 h-48 rounded-2xl bg-surface animate-pulse" />}>
        <ArtistCTA />
      </Suspense>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: APP_NAME,
            url: process.env.APP_URL || 'https://ngowamix.com',
            description: 'Plateforme de streaming musical africain',
            potentialAction: {
              '@type': 'SearchAction',
              target: `${process.env.APP_URL || 'https://ngowamix.com'}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
    </div>
  );
}

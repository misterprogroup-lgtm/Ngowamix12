import type { Metadata } from 'next';
import Link from 'next/link';
import { Crown, Headphones, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { APP_NAME, PREMIUM_PRICE, PREMIUM_CURRENCY } from '@/lib/constants';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { GenreFilter } from '@/components/home/genre-filter';

import { ArtistCTA } from '@/components/home/artist-cta';

export const metadata: Metadata = {
  title: `${APP_NAME} - Streaming musical africain gratuit`,
  description: 'Écoutez et découvrez la musique africaine francophone. Streaming gratuit, abonnement Premium à 1500 FCFA/mois et achat d\'albums.',
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
      genre: (a as any).genres,
    }));
  } catch {
    return [];
  }
}

async function getFeaturedArtists() {
  try {
    const artists = await db.artist.findMany({
      take: 6,
      include: { user: true },
    });
    return artists.map((a) => ({
      id: a.id,
      avatar: a.avatar,
      name: a.name,
      slug: a.slug,
      followers: '0',
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
      genre: (t as any).genre,
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
    genre: (t as any).genre,
  }));

  return (
    <div className="pb-8">
      <h1 className="sr-only">{APP_NAME} - Streaming musical africain</h1>

      <div className="mx-8 pt-4 mb-8">
        <HeroCarousel />
      </div>

      <GenreFilter
        tracks={trendingSongItems}
        albums={trendingAlbums}
        accounts={featuredArtists}
        recent={recentTracks}
      />

      <div className="mx-8 mb-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#ff990022] via-[#0b0b0b] to-[#0b0b0b] border border-[#ffffff08] p-8 md:p-12">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff9900] opacity-[0.04] rounded-full blur-3xl" />
          <div className="max-w-2xl relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#ff9900] flex items-center justify-center mb-5">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Passez au Premium
            </h2>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-[#888]">
                <Headphones className="h-5 w-5 text-[#ff9900] shrink-0" />
                Écoute sans publicité
              </li>
              <li className="flex items-center gap-3 text-[#888]">
                <Download className="h-5 w-5 text-[#ff9900] shrink-0" />
                Téléchargements illimités
              </li>
              <li className="flex items-center gap-3 text-[#888]">
                <Crown className="h-5 w-5 text-[#ff9900] shrink-0" />
                Qualité audio supérieure
              </li>
            </ul>
            <Link href="/premium">
              <Button variant="premium" size="lg">
                S&apos;abonner — {PREMIUM_PRICE} {PREMIUM_CURRENCY}/mois
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <ArtistCTA />

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

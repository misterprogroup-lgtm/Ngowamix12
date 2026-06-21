import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Crown, Sparkles, TrendingUp, Clock, Music } from 'lucide-react';
import { AlbumCard } from '@/components/catalog/album-card';
import { Button } from '@/components/ui/button';
import { HorizontalScroll } from '@/components/ui/horizontal-scroll';

import { RecentlyPlayed } from '@/components/catalog/recently-played';
import { RecommendationsWrapper } from '@/components/home/recommendations-wrapper';
import { SinglesCarousel } from '@/components/home/singles-carousel';
import { GenreGrid } from '@/components/home/genre-grid';
import { TopCharts } from '@/components/home/top-charts';
import { ArtistCTA } from '@/components/home/artist-cta';
import { WeeklyNewReleases } from '@/components/home/weekly-new-releases';
import { ROUTES, PREMIUM_PRICE, PREMIUM_CURRENCY, APP_NAME } from '@/lib/constants';

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

export const revalidate = 300;

async function getRecentAlbums() {
  try {
    const res = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/albums?limit=8&type=ALBUM`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return data.albums || [];
  } catch {
    return [];
  }
}

async function getRecentSingles() {
  try {
    const res = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/singles?limit=5`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return data.singles || [];
  } catch {
    return [];
  }
}

async function getPopularTracks() {
  try {
    const res = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/tracks?limit=10`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return data.tracks || [];
  } catch {
    return [];
  }
}

function SectionHeader({ icon: Icon, title, href }: { icon?: React.ComponentType<{ className?: string }>; title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-primary" />}
        <h2 className="text-xl md:text-2xl font-bold text-text-primary">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="text-sm font-semibold text-text-secondary hover:text-text-primary hover:underline transition-colors">
          Tout voir
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const recentAlbums = await getRecentAlbums();
  const recentSingles = await getRecentSingles();
  const popularTracks = await getPopularTracks();

  return (
    <div className="space-y-10 pb-8">
      <h1 className="sr-only">{APP_NAME} - Streaming musical africain</h1>

      {/* Hero Carousel */}
      <Suspense fallback={<div className="h-[300px] md:h-[400px] rounded-xl bg-surface-hover animate-pulse" />}>
        <SinglesCarousel />
      </Suspense>

      {/* Greeting + Quick Picks */}
      <div>
        <SectionHeader icon={Clock} title="Récemment écoutés" />
        <Suspense fallback={null}>
          <RecentlyPlayed />
        </Suspense>
      </div>

      {/* Made for You */}
      <div>
        <SectionHeader icon={Sparkles} title="Recommandations pour vous" />
        <Suspense fallback={null}>
          <RecommendationsWrapper />
        </Suspense>
      </div>

      {/* Genres */}
      <div>
        <SectionHeader icon={Music} title="Genres" href="/explore" />
        <GenreGrid />
      </div>

      {/* Top Charts */}
      <div>
        <SectionHeader icon={TrendingUp} title="Top Charts" />
        <TopCharts />
      </div>

      {/* New Releases - Albums */}
      {recentAlbums.length > 0 && (
        <HorizontalScroll
          title="Nouveautés"
          seeAllHref="/explore"
        >
          {recentAlbums.map((album: { id: string; title: string; slug: string; coverImage: string | null; price: number; isPremiumOnly: boolean; type: string; artist: { name: string; slug: string; isVerified?: boolean } }) => (
            <div key={album.id} className="snap-start shrink-0 w-[180px]">
              <AlbumCard
                id={album.id}
                title={album.title}
                slug={album.slug}
                coverImage={album.coverImage}
                artistName={album.artist.name}
                artistSlug={album.artist.slug}
                price={Number(album.price)}
                isPremiumOnly={album.isPremiumOnly}
                type={album.type as 'ALBUM' | 'SINGLE' | 'EP'}
                isArtistVerified={album.artist.isVerified}
              />
            </div>
          ))}
        </HorizontalScroll>
      )}

      {/* New Singles */}
      {recentSingles.length > 0 && (
        <HorizontalScroll
          title="Singles récents"
          seeAllHref="/explore"
        >
          {recentSingles.map((single: { id: string; title: string; slug: string; coverImage: string | null; price: number; isPremiumOnly: boolean; type: string; artist: { name: string; slug: string; isVerified?: boolean } }) => (
            <div key={single.id} className="snap-start shrink-0 w-[180px]">
              <AlbumCard
                key={single.id}
                id={single.id}
                title={single.title}
                slug={single.slug}
                coverImage={single.coverImage}
                artistName={single.artist.name}
                artistSlug={single.artist.slug}
                price={Number(single.price)}
                isPremiumOnly={single.isPremiumOnly}
                type={single.type as 'ALBUM' | 'SINGLE' | 'EP'}
                isArtistVerified={single.artist.isVerified}
              />
            </div>
          ))}
        </HorizontalScroll>
      )}

      {/* Weekly New Releases */}
      <WeeklyNewReleases />

      {/* Premium Upsell - Compact */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-primary/15 via-accent/10 to-primary/5 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Crown className="h-5 w-5 text-accent" />
              Passez au Premium
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Sans pub, qualité supérieure, téléchargements illimités
            </p>
          </div>
          <Link href="/premium">
            <Button variant="premium" size="sm">
              {PREMIUM_PRICE} {PREMIUM_CURRENCY}/mois
            </Button>
          </Link>
        </div>
      </div>

      {/* Artist CTA */}
      <ArtistCTA />

      {/* JSON-LD */}
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

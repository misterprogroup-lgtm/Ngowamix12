import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Crown, Headphones, Download, ArrowRight } from 'lucide-react';
import { AlbumCard } from '@/components/catalog/album-card';
import { Button } from '@/components/ui/button';
import { HorizontalScroll } from '@/components/ui/horizontal-scroll';

import { RecentlyPlayed } from '@/components/catalog/recently-played';
import { RecommendationsWrapper } from '@/components/home/recommendations-wrapper';
import { AnimatedSection } from '@/components/ui/animated-section';
import { HeroBanner } from '@/components/home/hero-banner';
import { CategoryTabs } from '@/components/home/category-tabs';
import { TrendingSongs } from '@/components/home/trending-songs';
import { GenreExplore } from '@/components/home/genre-explore';
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

export default async function HomePage() {
  const recentAlbums = await getRecentAlbums();
  const recentSingles = await getRecentSingles();
  const popularTracks = await getPopularTracks();

  return (
    <div className="space-y-8 md:space-y-10">
      {/* Hero Section */}
      <h1 className="sr-only">Ngowamix - Streaming musical africain</h1>
      <HeroBanner />

      {/* Category Tabs */}
      <CategoryTabs />

      {/* Trending Songs */}
      <TrendingSongs />

      {/* Explore Section */}
      <GenreExplore />

      {/* Recently Played */}
      <Suspense fallback={null}><AnimatedSection delay={0.05}><RecentlyPlayed /></AnimatedSection></Suspense>

      {/* Personalized Recommendations */}
      <AnimatedSection delay={0.07}>
        <div className="container mx-auto px-4">
          <RecommendationsWrapper />
        </div>
      </AnimatedSection>

      {/* Genre Grid */}
      <AnimatedSection delay={0.15}><GenreGrid /></AnimatedSection>

      {/* Top Charts */}
      <AnimatedSection delay={0.2}><TopCharts /></AnimatedSection>

      {/* Recent Albums */}
      {recentAlbums.length > 0 && (
        <AnimatedSection delay={0.25} className="bg-surface/50">
          <div className="container mx-auto px-4">
            <HorizontalScroll title="Albums récents" seeAllHref="/explore">
              {recentAlbums.map((album: { id: string; title: string; slug: string; coverImage: string | null; price: number; isPremiumOnly: boolean; type: string; artist: { name: string; slug: string; isVerified?: boolean } }) => (
                <div key={album.id} className="snap-start shrink-0 w-40">
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
          </div>
      </AnimatedSection>
      )}

      {/* Recent Singles */}
      {recentSingles.length > 0 && (
        <AnimatedSection delay={0.3} className="relative">
          <div className="container mx-auto px-4 relative">
            <HorizontalScroll
              title={<div className="flex items-center gap-3"><div className="h-8 w-1 rounded-full bg-linear-to-b from-primary to-accent" />Singles récents</div>}
              seeAllHref="/explore"
            >
              {recentSingles.map((single: { id: string; title: string; slug: string; coverImage: string | null; price: number; isPremiumOnly: boolean; type: string; artist: { name: string; slug: string; isVerified?: boolean } }) => (
                <div key={single.id} className="snap-start shrink-0 w-40">
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
          </div>
        </AnimatedSection>
      )}

      {/* Premium Banner */}
      <AnimatedSection delay={0.35}>
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden bg-linear-to-r from-primary/20 to-accent/20 p-8 md:p-12">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Passez au Premium
              </h2>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-text-secondary">
                  <Headphones className="h-5 w-5 text-primary shrink-0" />
                  Écoute sans publicité
                </li>
                <li className="flex items-center gap-2 text-text-secondary">
                  <Download className="h-5 w-5 text-primary shrink-0" />
                  Téléchargements illimités
                </li>
                <li className="flex items-center gap-2 text-text-secondary">
                  <Crown className="h-5 w-5 text-primary shrink-0" />
                  Qualité audio supérieure
                </li>
              </ul>
              <Link href="/premium">
                <Button variant="premium" size="lg">
                  S&apos;abonner — {PREMIUM_PRICE} {PREMIUM_CURRENCY}/mois
                </Button>
              </Link>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/3 bg-linear-to-l from-primary/10 to-transparent hidden lg:block" />
          </div>
        </div>
      </AnimatedSection>

      {/* Weekly New Releases */}
      <AnimatedSection delay={0.4}><WeeklyNewReleases /></AnimatedSection>

      {/* Artist CTA */}
      <AnimatedSection delay={0.45}><ArtistCTA /></AnimatedSection>

      {/* Buy Albums Section */}
      {recentAlbums.length > 0 && (
        <AnimatedSection delay={0.5} className="bg-surface/50">
          <div className="container mx-auto px-4">
            <HorizontalScroll
              title="Acheter des albums"
              description="Soutenez directement vos artistes préférés en achetant leurs albums et singles. Après l'achat, téléchargez et écoutez hors ligne autant que vous voulez."
              seeAllHref="/explore"
            >
              {recentAlbums.slice(0, 5).map((album: { id: string; title: string; slug: string; coverImage: string | null; price: number; isPremiumOnly: boolean; type: string; artist: { name: string; slug: string; isVerified?: boolean } }) => (
                <div key={album.id} className="snap-start shrink-0 w-40">
                  <AlbumCard
                    key={album.id}
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
          </div>
        </AnimatedSection>
      )}

      {/* JSON-LD Structured Data */}
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

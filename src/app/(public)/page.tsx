import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Crown, Headphones, Download, Sparkles, ArrowRight } from 'lucide-react';
import { AlbumCard } from '@/components/catalog/album-card';
import { Button } from '@/components/ui/button';
import { HorizontalScroll } from '@/components/ui/horizontal-scroll';

import { RecommendationsWrapper } from '@/components/home/recommendations-wrapper';
import { AnimatedSection } from '@/components/ui/animated-section';
import { SinglesCarousel } from '@/components/home/singles-carousel';
import { GenreGrid } from '@/components/home/genre-grid';
import { TopCharts } from '@/components/home/top-charts';
import { ArtistCTA } from '@/components/home/artist-cta';
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

export default async function HomePage() {
  const recentAlbums = await getRecentAlbums();
  const recentSingles = await getRecentSingles();
  const newReleases = [...recentAlbums, ...recentSingles].slice(0, 8);

  return (
    <div>
      <h1 className="sr-only">Ngowamix - Streaming musical africain</h1>

      {/* Hero */}
      <SinglesCarousel />

      {/* Top Charts */}
      <AnimatedSection delay={0.05}>
        <div className="container mx-auto px-4 -mt-8 md:-mt-20 relative z-20">
          <div className="rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <TopCharts />
          </div>
        </div>
      </AnimatedSection>

      {/* Genres */}
      <AnimatedSection delay={0.1}>
        <div className="mt-8 md:mt-12">
          <GenreGrid />
        </div>
      </AnimatedSection>

      {/* Recommendations */}
      <AnimatedSection delay={0.15}>
        <div className="mt-8 md:mt-12">
          <RecommendationsWrapper />
        </div>
      </AnimatedSection>

      {/* New Releases (merged albums + singles) */}
      {newReleases.length > 0 && (
        <AnimatedSection delay={0.2}>
          <div className="container mx-auto px-4 mt-8 md:mt-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Nouvelles sorties</h2>
              </div>
              <Link href="/explore" className="text-sm font-medium text-primary hover:text-primary-hover hidden md:flex items-center gap-1 shrink-0">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="hidden md:grid md:grid-cols-4 gap-5">
              {newReleases.map((item: { id: string; title: string; slug: string; coverImage: string | null; price: number; isPremiumOnly: boolean; type: string; artist: { name: string; slug: string; isVerified?: boolean } }) => (
                <AlbumCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  slug={item.slug}
                  coverImage={item.coverImage}
                  artistName={item.artist.name}
                  artistSlug={item.artist.slug}
                  price={Number(item.price)}
                  isPremiumOnly={item.isPremiumOnly}
                  type={item.type as 'ALBUM' | 'SINGLE' | 'EP'}
                  isArtistVerified={item.artist.isVerified}
                />
              ))}
            </div>
            <div className="md:hidden">
              <HorizontalScroll seeAllHref="/explore">
                {newReleases.map((item: { id: string; title: string; slug: string; coverImage: string | null; price: number; isPremiumOnly: boolean; type: string; artist: { name: string; slug: string; isVerified?: boolean } }) => (
                  <div key={item.id} className="snap-start shrink-0 w-40">
                    <AlbumCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      slug={item.slug}
                      coverImage={item.coverImage}
                      artistName={item.artist.name}
                      artistSlug={item.artist.slug}
                      price={Number(item.price)}
                      isPremiumOnly={item.isPremiumOnly}
                      type={item.type as 'ALBUM' | 'SINGLE' | 'EP'}
                      isArtistVerified={item.artist.isVerified}
                    />
                  </div>
                ))}
              </HorizontalScroll>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Premium Banner */}
      <AnimatedSection delay={0.25}>
        <div className="container mx-auto px-4 mt-8 md:mt-12">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-accent/80 p-8 md:p-12">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
            <div className="relative z-10 max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-6 w-6 text-white" />
                <span className="text-sm font-semibold text-white/80 uppercase tracking-wider">Premium</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Passez au Premium
              </h2>
              <p className="text-white/80 mb-8 max-w-md">
                Écoutez sans publicité, téléchargez vos titres préférés et profitez de la meilleure qualité audio.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-white">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Headphones className="h-4 w-4" />
                  </div>
                  <span>Écoute sans publicité</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Download className="h-4 w-4" />
                  </div>
                  <span>Téléchargements illimités</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Crown className="h-4 w-4" />
                  </div>
                  <span>Qualité audio supérieure</span>
                </li>
              </ul>
              <Link href="/premium">
                <Button variant="secondary" size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 shadow-xl">
                  S&apos;abonner — {PREMIUM_PRICE} {PREMIUM_CURRENCY}/mois
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Artist CTA */}
      <AnimatedSection delay={0.3}>
        <div className="mt-8 md:mt-12">
          <ArtistCTA />
        </div>
      </AnimatedSection>

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

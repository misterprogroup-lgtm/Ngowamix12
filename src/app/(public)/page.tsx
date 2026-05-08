import type { Metadata } from 'next';
import Link from 'next/link';
import { Play, Crown, Headphones, Download } from 'lucide-react';
import { AlbumCard } from '@/components/catalog/album-card';
import { ArtistCard } from '@/components/catalog/artist-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeroSlider } from '@/components/ui/hero-slider';
import { ROUTES, PREMIUM_PRICE, PREMIUM_CURRENCY, APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `${APP_NAME} - Streaming musical africain gratuit`,
  description: 'Écoutez et découvrez la musique africaine francophone. Streaming gratuit, abonnement Premium à 5000 FCFA/mois et achat d\'albums.',
};

export const dynamic = 'force-dynamic';

async function getFeaturedArtists() {
  try {
    const res = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/artists?limit=6`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return data.artists || [];
  } catch {
    return [];
  }
}

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
  const featuredArtists = await getFeaturedArtists();
  const recentAlbums = await getRecentAlbums();
  const recentSingles = await getRecentSingles();
  const popularTracks = await getPopularTracks();

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroSlider />

        <div className="relative z-20 max-w-3xl mx-auto px-4 text-center">
          <Badge variant="premium" className="mb-6">
            <Crown className="h-3 w-3 mr-1" />
            Premium disponible
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
            La musique africaine
            <span className="gradient-text"> sans limites</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Écoutez des milliers de titres, découvrez de nouveaux artistes et soutenez la scène musicale africaine francophone.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={ROUTES.EXPLORE}>
              <Button variant="primary" size="lg">
                <Play className="h-5 w-5 mr-2" fill="currentColor" />
                Commencer à écouter
              </Button>
            </Link>
            <Link href="/premium">
              <Button variant="premium" size="lg">
                <Crown className="h-5 w-5 mr-2" />
                Premium — {PREMIUM_PRICE} {PREMIUM_CURRENCY}/mois
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      {featuredArtists.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Artistes à la une</h2>
              <Link href="/explore?type=artist" className="text-sm text-primary hover:underline">
                Voir tous
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
              {featuredArtists.map((artist: { id: string; name: string; slug: string; avatar: string | null; isVerified: boolean }) => (
                <ArtistCard
                  key={artist.id}
                  id={artist.id}
                  name={artist.name}
                  slug={artist.slug}
                  avatar={artist.avatar}
                  isVerified={artist.isVerified}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Albums */}
      {recentAlbums.length > 0 && (
        <section className="py-12 bg-surface/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Albums récents</h2>
              <Link href="/explore?type=album" className="text-sm text-primary hover:underline">
                Voir tous
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {recentAlbums.map((album: { id: string; title: string; slug: string; coverImage: string | null; price: number; isPremiumOnly: boolean; type: string; artist: { name: string; slug: string; isVerified?: boolean } }) => (
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
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Singles */}
      {recentSingles.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Singles récents</h2>
              <Link href="/explore?type=single" className="text-sm text-primary hover:underline">
                Voir tous
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {recentSingles.map((single: { id: string; title: string; slug: string; coverImage: string | null; price: number; isPremiumOnly: boolean; type: string; artist: { name: string; slug: string; isVerified?: boolean } }) => (
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
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Premium Banner */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/20 to-accent/20 p-8 md:p-12">
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
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/10 to-transparent hidden lg:block" />
          </div>
        </div>
      </section>

      {/* Buy Albums Section */}
      {recentAlbums.length > 0 && (
        <section className="py-12 bg-surface/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Acheter des albums</h2>
              <Link href="/explore" className="text-sm text-primary hover:underline">
                Explorer le catalogue
              </Link>
            </div>
            <p className="text-text-secondary mb-8 max-w-2xl">
              Soutenez directement vos artistes préférés en achetant leurs albums et singles. 
              Après l&apos;achat, téléchargez et écoutez hors ligne autant que vous voulez.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {recentAlbums.slice(0, 5).map((album: { id: string; title: string; slug: string; coverImage: string | null; price: number; isPremiumOnly: boolean; type: string; artist: { name: string; slug: string; isVerified?: boolean } }) => (
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
              ))}
            </div>
          </div>
        </section>
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

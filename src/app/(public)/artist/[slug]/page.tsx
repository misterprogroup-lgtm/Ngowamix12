import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Music, Play, Users, Instagram, Twitter, Facebook, Youtube, CheckCircle2 } from 'lucide-react';
import { AlbumCard } from '@/components/catalog/album-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatPrice } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { db } from '@/lib/db';

interface ArtistPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { slug } = await params;
  const artist = await db.artist.findUnique({ where: { slug } });

  if (!artist) return { title: 'Artiste non trouvé' };

  return {
    title: `${artist.name} — Artiste sur ${APP_NAME}`,
    description: artist.bio ? `${artist.bio.substring(0, 150)}...` : `Découvrez la musique de ${artist.name} sur ${APP_NAME}`,
    openGraph: {
      title: `${artist.name} — ${APP_NAME}`,
      description: artist.bio?.substring(0, 150),
      images: artist.avatar ? [{ url: artist.avatar }] : [],
    },
  };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params;

  const artist = await db.artist.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { albums: true },
      },
    },
  });

  if (!artist) {
    notFound();
  }

  const albums = await db.album.findMany({
    where: { artistId: artist.id, status: 'PUBLISHED' },
    include: {
      artist: {
        select: { name: true, slug: true, avatar: true },
      },
      _count: {
        select: { reviews: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const albumsWithRatings = await Promise.all(
    albums.map(async (album) => {
      const stats = await db.review.aggregate({
        where: { albumId: album.id },
        _avg: { rating: true },
      });
      return {
        ...album,
        averageRating: stats._avg.rating || 0,
        totalReviews: album._count.reviews,
      };
    }),
  );

  const socialLinks = artist.socialLinks ? JSON.parse(artist.socialLinks) as Record<string, string> : null;

  return (
    <div className="pb-24">
      <div className="relative h-64 md:h-80 overflow-hidden">
        {artist.coverImage ? (
          <Image src={artist.coverImage} alt={artist.name} fill className="object-cover" priority />
        ) : (
          <div className="h-full bg-gradient-to-r from-primary/20 to-accent/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <div className="flex items-end gap-6">
            <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden border-4 border-background shrink-0">
              {artist.avatar ? (
                <Image src={artist.avatar} alt={artist.name} fill className="object-cover" priority />
              ) : (
                <div className="flex h-full items-center justify-center bg-surface text-text-muted">
                  <Music className="h-12 w-12" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                {artist.isVerified && <Badge variant="premium"><CheckCircle2 className="h-3 w-3 mr-1" />Vérifié</Badge>}
                {artist.country && <Badge variant="secondary">{artist.country}</Badge>}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-2 flex items-center gap-2">
                {artist.name}
                {artist.isVerified && <CheckCircle2 className="h-6 w-6 text-primary hidden md:block" />}
              </h1>
              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {albums.length} album{albums.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        {artist.bio && (
          <div className="max-w-3xl mb-12">
            <h2 className="text-xl font-semibold mb-3">Biographie</h2>
            <p className="text-text-secondary whitespace-pre-wrap">{artist.bio}</p>
          </div>
        )}

        {socialLinks && Object.keys(socialLinks).length > 0 && (
          <div className="flex items-center gap-3 mb-12">
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            )}
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            )}
            {socialLinks.youtube && (
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            )}
          </div>
        )}

        {albums.length > 0 ? (
          <section>
            <h2 className="text-xl font-semibold mb-6">Musiques</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {albumsWithRatings.map((album) => (
                <AlbumCard
                  key={album.id}
                  id={album.id}
                  title={album.title}
                  slug={album.slug}
                  coverImage={album.coverImage}
                  artistName={artist.name}
                  artistSlug={artist.slug}
                  price={Number(album.price)}
                  isPremiumOnly={album.isPremiumOnly}
                  type={album.type}
                  averageRating={album.averageRating}
                  totalReviews={album.totalReviews}
                />
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-16">
            <Music className="h-12 w-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">Aucune musique disponible pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
}

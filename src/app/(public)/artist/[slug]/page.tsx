import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SafeImage } from '@/components/ui/safe-image';
import { Music, Headphones, Instagram, Twitter, Facebook, Youtube, CheckCircle2, Play, Ticket, Heart } from 'lucide-react';
import Link from 'next/link';
import { AlbumCard } from '@/components/catalog/album-card';
import { TopTracks } from '@/components/catalog/top-tracks';
import { SupportArtist } from '@/components/catalog/support-artist';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FollowButton } from '@/components/catalog/follow-button';
import { MessageArtistButton } from '@/components/messages/message-artist-button';
import { formatNumber } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

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
    alternates: { canonical: `/artist/${slug}` },
    openGraph: {
      title: `${artist.name} — ${APP_NAME}`,
      description: artist.bio?.substring(0, 150),
      images: artist.avatar ? [{ url: artist.avatar, width: 600, height: 600 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${artist.name} — ${APP_NAME}`,
      description: artist.bio?.substring(0, 150),
      images: artist.avatar ? [artist.avatar] : [],
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

  const topTracks = await db.track.findMany({
    where: {
      album: {
        artistId: artist.id,
        status: 'PUBLISHED',
      },
    },
    include: {
      album: {
        select: {
          title: true,
          slug: true,
          coverImage: true,
          artist: { select: { name: true, slug: true } },
        },
      },
    },
    orderBy: { playCount: 'desc' },
    take: 5,
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyListens = await db.listenHistory.count({
    where: {
      track: {
        album: {
          artistId: artist.id,
        },
      },
      playedAt: { gte: startOfMonth },
    },
  });

  const socialLinks = artist.socialLinks ? JSON.parse(artist.socialLinks) as Record<string, string> : null;

  const upcomingConcerts = await db.concert.count({
    where: {
      artistId: artist.id,
      date: { gte: now },
      isActive: true,
    },
  });

  const currentUser = await getCurrentUser();
  let isFollowing = false;
  if (currentUser) {
    const fav = await db.favorite.findFirst({
      where: { userId: currentUser.sub, artistId: artist.id },
    });
    isFollowing = !!fav;
  }
  const followerCount = await db.favorite.count({
    where: { artistId: artist.id },
  });

  return (
    <div className="pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://ngowamix.com/' },
              { '@type': 'ListItem', position: 2, name: 'Artistes', item: 'https://ngowamix.com/explore' },
              { '@type': 'ListItem', position: 3, name: artist.name, item: `https://ngowamix.com/artist/${slug}` },
            ],
          }),
        }}
      />
      <div className="relative h-64 md:h-80 overflow-hidden">
        {artist.coverImage ? (
          <SafeImage src={artist.coverImage} alt={artist.name} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 1200px" fallback={<div className="h-full bg-linear-to-r from-primary/20 to-accent/20" />} />
        ) : (
          <div className="h-full bg-linear-to-r from-primary/20 to-accent/20" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <div className="flex items-end gap-6">
            <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden border-4 border-background shrink-0">
              {artist.avatar ? (
                <SafeImage src={artist.avatar} alt={artist.name} fill className="object-cover" priority sizes="128px" fallback={<div className="flex h-full items-center justify-center bg-surface text-text-muted"><Music className="h-12 w-12" /></div>} />
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
              <div className="flex items-center gap-4 md:gap-6 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-10 w-10 md:h-auto md:w-auto rounded-full bg-surface md:bg-transparent shrink-0">
                    <Headphones className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center leading-tight">
                    <span className="text-xs md:text-sm font-semibold md:font-normal text-text-primary md:text-text-secondary">
                      {formatNumber(monthlyListens)}
                    </span>
                    <span className="hidden md:inline md:ml-1">
                      écoute{monthlyListens !== 1 ? 's' : ''} ce mois-ci
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-10 w-10 md:h-auto md:w-auto rounded-full bg-surface md:bg-transparent shrink-0">
                    <Music className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center leading-tight">
                    <span className="text-xs md:text-sm font-semibold md:font-normal text-text-primary md:text-text-secondary">
                      {albums.length}
                    </span>
                    <span className="hidden md:inline md:ml-1">
                      titre{albums.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
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
          <div className="flex items-center gap-3 mb-8">
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

        <div className="flex flex-wrap items-center gap-3 mb-12">
          <FollowButton artistId={artist.id} initiallyFollowing={isFollowing} followerCount={followerCount} />
          <MessageArtistButton artistUserId={artist.userId} />
          <SupportArtist artistId={artist.id} artistName={artist.name} />
          {upcomingConcerts > 0 && (
            <Link href={`/tickets?artist=${artist.slug}`}>
              <Button variant="primary" size="lg">
                <Ticket className="h-5 w-5 mr-2" />
                Concert{upcomingConcerts > 1 ? 's' : ''} ({upcomingConcerts})
              </Button>
            </Link>
          )}
        </div>

        {topTracks.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Les plus écoutés
            </h2>
            <TopTracks tracks={topTracks.map(t => ({
              id: t.id,
              title: t.title,
              duration: t.duration,
              playCount: t.playCount,
              audioFile: t.audioFile,
              album: {
                title: t.album.title,
                slug: t.album.slug,
                coverImage: t.album.coverImage,
                artist: { name: t.album.artist.name, slug: t.album.artist.slug },
              },
            }))} />
          </section>
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

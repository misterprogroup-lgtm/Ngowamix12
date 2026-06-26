import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SafeImage } from '@/components/ui/safe-image';
import { Music, Headphones, Instagram, Twitter, Facebook, Youtube, CheckCircle2, Play, Ticket } from 'lucide-react';
import Link from 'next/link';
import { AlbumCard } from '@/components/catalog/album-card';
import { TopTracks } from '@/components/catalog/top-tracks';
import { SupportArtist } from '@/components/catalog/support-artist';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FollowButton } from '@/components/catalog/follow-button';
import { MessageArtistButton } from '@/components/messages/message-artist-button';
import { AnimateOnView } from '@/components/ui/animate-on-view';
import { ArtistDiscography } from '@/components/artist/artist-discography';
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
      _count: { select: { albums: true } },
    },
  });

  if (!artist) notFound();

  const albums = await db.album.findMany({
    where: { artistId: artist.id, status: 'PUBLISHED' },
    include: {
      artist: { select: { name: true, slug: true, avatar: true, isVerified: true } },
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const albumsWithRatings = await Promise.all(
    albums.map(async (album) => {
      const stats = await db.review.aggregate({
        where: { albumId: album.id },
        _avg: { rating: true },
      });
      return { ...album, averageRating: stats._avg.rating || 0, totalReviews: album._count.reviews };
    }),
  );

  const topTracks = await db.track.findMany({
    where: { album: { artistId: artist.id, status: 'PUBLISHED' } },
    include: {
      album: {
        select: { id: true, title: true, slug: true, coverImage: true, artist: { select: { name: true, slug: true } } },
      },
    },
    orderBy: { playCount: 'desc' },
    take: 5,
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [monthlyListens, followerCount] = await Promise.all([
    db.listenHistory.count({ where: { track: { album: { artistId: artist.id } }, playedAt: { gte: startOfMonth } } }),
    db.favorite.count({ where: { artistId: artist.id } }),
  ]);

  const socialLinks = artist.socialLinks ? JSON.parse(artist.socialLinks) as Record<string, string> : null;
  const genres = artist.genres ? artist.genres.split(',').map(g => g.trim()).filter(Boolean) : [];

  const upcomingConcerts = await db.concert.count({
    where: { artistId: artist.id, date: { gte: now }, isActive: true },
  });

  const currentUser = await getCurrentUser();
  let isFollowing = false;
  if (currentUser) {
    const fav = await db.favorite.findFirst({ where: { userId: currentUser.sub, artistId: artist.id } });
    isFollowing = !!fav;
  }

  const singles = albumsWithRatings.filter(a => a.type === 'SINGLE');
  const fullAlbums = albumsWithRatings.filter(a => a.type === 'ALBUM' || a.type === 'EP');

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

      <AnimateOnView className="relative h-56 md:h-80 overflow-hidden">
        {artist.coverImage ? (
          <SafeImage src={artist.coverImage} alt={artist.name} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 1200px" fallback={<div className="h-full bg-linear-to-r from-primary/20 to-accent/20" />} />
        ) : (
          <div className="h-full bg-linear-to-r from-primary/20 to-accent/20" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-6 md:pb-8">
          <div className="flex items-end gap-4 md:gap-6">
            <div className="relative h-20 w-20 md:h-36 md:w-36 rounded-full overflow-hidden border-2 md:border-4 border-background shrink-0 -mb-2 md:mb-0 shadow-xl">
              {artist.avatar ? (
                <SafeImage src={artist.avatar} alt={artist.name} fill className="object-cover" priority sizes="80px" fallback={<div className="flex h-full items-center justify-center bg-surface text-text-muted"><Music className="h-8 w-8 md:h-12 md:w-12" /></div>} />
              ) : (
                <div className="flex h-full items-center justify-center bg-surface text-text-muted"><Music className="h-8 w-8 md:h-12 md:w-12" /></div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {artist.isVerified && <Badge variant="premium"><CheckCircle2 className="h-3 w-3 mr-1" />Vérifié</Badge>}
                {artist.country && <Badge variant="secondary">{artist.country}</Badge>}
                {genres.slice(0, 2).map(g => (
                  <Badge key={g} variant="secondary">{g}</Badge>
                ))}
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold flex items-center gap-2">
                {artist.name}
                {artist.isVerified && <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-primary shrink-0" />}
              </h1>
              <div className="flex items-center gap-4 md:gap-6 mt-2 text-sm text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <Headphones className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="font-semibold text-text-primary">{formatNumber(monthlyListens)}</span>
                  <span className="hidden md:inline">écoute{monthlyListens !== 1 ? 's' : ''} / mois</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Music className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="font-semibold text-text-primary">{albums.length}</span>
                  <span className="hidden md:inline">titre{albums.length !== 1 ? 's' : ''}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="font-semibold text-text-primary">{formatNumber(followerCount)}</span>
                  <span className="hidden md:inline">abonné{followerCount !== 1 ? 's' : ''}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </AnimateOnView>

      <div className="container mx-auto px-4 mt-6 md:mt-8">
        <AnimateOnView delay={100} className="flex flex-wrap items-center gap-3 mb-8">
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
        </AnimateOnView>

        {artist.bio && (
          <AnimateOnView delay={150} className="mb-10">
            <div className="rounded-xl border border-border bg-surface p-5 md:p-6">
              <h2 className="text-base font-semibold mb-2">Biographie</h2>
              <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">{artist.bio}</p>
            </div>
          </AnimateOnView>
        )}

        {socialLinks && Object.keys(socialLinks).length > 0 && (
          <AnimateOnView delay={175} className="flex items-center gap-3 mb-8">
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-text-secondary hover:text-primary hover:border-primary/30 transition-all">
                <Instagram className="h-4 w-4" /> Instagram
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-text-secondary hover:text-primary hover:border-primary/30 transition-all">
                <Twitter className="h-4 w-4" /> X
              </a>
            )}
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-text-secondary hover:text-primary hover:border-primary/30 transition-all">
                <Facebook className="h-4 w-4" /> Facebook
              </a>
            )}
            {socialLinks.youtube && (
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-text-secondary hover:text-primary hover:border-primary/30 transition-all">
                <Youtube className="h-4 w-4" /> YouTube
              </a>
            )}
          </AnimateOnView>
        )}

        {topTracks.length > 0 && (
          <AnimateOnView delay={200} as="section" className="mb-12">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
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
          </AnimateOnView>
        )}

        {albums.length > 0 ? (
          <AnimateOnView delay={250}>
            <ArtistDiscography
              singles={singles}
              albums={fullAlbums}
              artistName={artist.name}
              artistSlug={artist.slug}
            />
          </AnimateOnView>
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

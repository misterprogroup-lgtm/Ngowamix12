import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SafeImage } from '@/components/ui/safe-image';
import Link from 'next/link';
import { Clock, Headphones, Music, BadgeCheck, ListMusic } from 'lucide-react';
import { db } from '@/lib/db';
import { APP_NAME, APP_BASE_URL } from '@/lib/constants';
import { formatDuration, formatNumber } from '@/lib/utils';
import { TrackActions } from '@/components/track/track-actions';
import { TrackList } from '@/components/catalog/track-list';
import { PremiumLockOverlay } from '@/components/premium/premium-lock-overlay';
import { AnimateOnView } from '@/components/ui/animate-on-view';
import type { Track } from '@/types';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const track = await db.track.findUnique({
    where: { id },
    include: { album: { include: { artist: { select: { name: true, slug: true } } } } },
  });

  if (!track) return { title: `Musique non trouvée — ${APP_NAME}` };

  const title = `${track.title} — ${track.album.artist.name} — ${APP_NAME}`;
  const description = `Écoutez ${track.title} de ${track.album.artist.name} sur ${APP_NAME}. ${formatDuration(track.duration)} — ${formatNumber(track.playCount)} écoutes.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'music.song',
      url: `${APP_BASE_URL}/track/${id}`,
      images: track.album.coverImage ? [{ url: track.album.coverImage, width: 300, height: 300 }] : [],
      siteName: APP_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: track.album.coverImage ? [track.album.coverImage] : [],
    },
    alternates: { canonical: `/track/${id}` },
  };
}

export default async function TrackPage({ params }: PageProps) {
  const { id } = await params;

  const track = await db.track.findUnique({
    where: { id },
    include: {
      album: {
        include: {
          artist: { select: { id: true, name: true, slug: true, isVerified: true, avatar: true } },
        },
      },
    },
  });

  if (!track) notFound();

  const albumTracks = await db.track.findMany({
    where: { albumId: track.albumId },
    include: {
      album: {
        include: {
          artist: { select: { id: true, name: true, slug: true, isVerified: true, avatar: true } },
        },
      },
    },
    orderBy: { trackNumber: 'asc' },
  });

  const recommendations = await db.track.findMany({
    where: {
      id: { not: track.id },
      album: track.album.genre ? { genre: track.album.genre } : undefined,
    },
    include: {
      album: {
        include: {
          artist: { select: { id: true, name: true, slug: true, isVerified: true, avatar: true } },
        },
      },
    },
    orderBy: { playCount: 'desc' },
    take: 6,
  });

  const totalDuration = albumTracks.reduce((sum, t) => sum + t.duration, 0);

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MusicRecording',
            name: track.title,
            duration: `PT${Math.floor(track.duration / 60)}M${track.duration % 60}S`,
            url: `${APP_BASE_URL}/track/${id}`,
            image: track.album.coverImage,
            byArtist: {
              '@type': 'MusicGroup',
              name: track.album.artist.name,
              url: `${APP_BASE_URL}/artist/${track.album.artist.slug}`,
            },
            inAlbum: {
              '@type': track.album.type === 'SINGLE' ? 'MusicSingle' : track.album.type === 'EP' ? 'EPRelease' : 'MusicAlbum',
              name: track.album.title,
              url: `${APP_BASE_URL}/album/${track.album.id}`,
              image: track.album.coverImage,
            },
            position: track.trackNumber,
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${APP_BASE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Catalogue', item: `${APP_BASE_URL}/explore` },
              { '@type': 'ListItem', position: 3, name: track.album.title, item: `${APP_BASE_URL}/album/${track.album.id}` },
              { '@type': 'ListItem', position: 4, name: track.title, item: `${APP_BASE_URL}/track/${id}` },
            ],
          }),
        }}
      />

      <Link
        href={`/album/${track.album.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-8"
      >
        ← Retour à l&apos;album
      </Link>

      <AnimateOnView className="flex flex-col md:flex-row gap-8 lg:gap-12 mb-12">
        <div className="shrink-0 w-full md:w-auto">
          <div className="relative w-full max-w-xs mx-auto md:mx-0 md:w-72 aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/5 bg-surface-hover">
            {track.album.coverImage ? (
              <SafeImage
                src={track.album.coverImage}
                alt={track.album.title}
                fill
                className={track.isPremiumOnly ? 'opacity-60' : 'object-cover'}
                priority
                sizes="(max-width: 768px) 100vw, 288px"
                fallback={<div className="flex h-full items-center justify-center text-text-muted"><Music className="h-20 w-20" /></div>}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted">
                <Music className="h-20 w-20" />
              </div>
            )}
            <PremiumLockOverlay isPremiumOnly={track.isPremiumOnly} variant="cover" />
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            {track.isExplicit && (
              <span className="px-2 py-0.5 rounded-sm bg-red-500/10 text-red-500 text-xs font-bold">EXPLICIT</span>
            )}
            {track.isPremiumOnly && (
              <span className="px-2 py-0.5 rounded-sm bg-primary/10 text-primary text-xs font-bold">PREMIUM</span>
            )}
            {track.isPremiumOnly && (
              <span className="px-2 py-0.5 rounded-sm bg-primary/10 text-primary text-xs font-bold">HQ</span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">{track.title}</h1>

          <Link
            href={`/artist/${track.album.artist.slug}`}
            className="text-lg md:text-xl text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1.5 w-fit"
          >
            {track.album.artist.name}
            {track.album.artist.isVerified && (
              <BadgeCheck className="h-4 w-4 text-primary" />
            )}
          </Link>

          <Link
            href={`/album/${track.album.id}`}
            className="mt-1 text-sm text-text-muted hover:text-primary transition-colors w-fit"
          >
            {track.album.title} · {albumTracks.length} titre{albumTracks.length !== 1 ? 's' : ''} · {formatDuration(totalDuration)}
          </Link>

          <div className="flex items-center gap-4 mt-3 text-sm text-text-secondary">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(track.duration)}
            </span>
            <span className="flex items-center gap-1">
              <Headphones className="h-4 w-4" />
              {formatNumber(track.playCount)} écoutes
            </span>
          </div>

          <div className="mt-6">
            <TrackActions
              track={track as unknown as Track}
              albumTracks={albumTracks as unknown as Track[]}
            />
          </div>
        </div>
      </AnimateOnView>

      {albumTracks.length > 1 && (
        <AnimateOnView delay={100} as="section" className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <ListMusic className="h-5 w-5 text-text-secondary" />
            <h2 className="text-lg font-bold">
              Autres titres de l&apos;album
            </h2>
          </div>
          <TrackList tracks={albumTracks as unknown as Track[]} />
        </AnimateOnView>
      )}

      {recommendations.length > 0 && (
        <AnimateOnView delay={200} as="section">
          <h2 className="text-lg font-bold mb-4">Vous aimerez aussi</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendations.map((rec) => (
              <Link
                key={rec.id}
                href={`/track/${rec.id}`}
                className="group block"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-hover mb-2 ring-1 ring-white/5 group-hover:ring-primary/30 transition-all shadow-md shadow-black/20">
                  {rec.album.coverImage ? (
                    <SafeImage
                      src={rec.album.coverImage}
                      alt={rec.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      fallback={<div className="flex h-full items-center justify-center text-text-muted"><Music className="h-8 w-8" /></div>}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-text-muted">
                      <Music className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {rec.title}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {rec.album.artist.name}
                </p>
              </Link>
            ))}
          </div>
        </AnimateOnView>
      )}
    </div>
  );
}

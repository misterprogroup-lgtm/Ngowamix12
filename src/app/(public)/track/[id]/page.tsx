import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SafeImage } from '@/components/ui/safe-image';
import Link from 'next/link';
import { Music, Clock, Headphones, BadgeCheck } from 'lucide-react';
import { db } from '@/lib/db';
import { APP_NAME } from '@/lib/constants';
import { formatDuration, formatNumber } from '@/lib/utils';

const BASE_URL = process.env.APP_URL || 'https://ngowamix.com';

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
      url: `${BASE_URL}/track/${id}`,
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
          artist: { select: { name: true, slug: true, isVerified: true } },
        },
      },
    },
  });

  if (!track) notFound();

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
            url: `${BASE_URL}/track/${id}`,
            image: track.album.coverImage,
            byArtist: {
              '@type': 'MusicGroup',
              name: track.album.artist.name,
              url: `${BASE_URL}/artist/${track.album.artist.slug}`,
            },
            inAlbum: {
              '@type': track.album.type === 'SINGLE' ? 'MusicSingle' : track.album.type === 'EP' ? 'EPRelease' : 'MusicAlbum',
              name: track.album.title,
              url: `${BASE_URL}/album/${track.album.id}`,
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
              { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${BASE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Catalogue', item: `${BASE_URL}/explore` },
              { '@type': 'ListItem', position: 3, name: track.album.title, item: `${BASE_URL}/album/${track.album.id}` },
              { '@type': 'ListItem', position: 4, name: track.title, item: `${BASE_URL}/track/${id}` },
            ],
          }),
        }}
      />

      <Link
        href={`/album/${track.album.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-6"
      >
        ← Retour à l&apos;album
      </Link>

      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative w-56 h-56 rounded-2xl overflow-hidden shadow-2xl mb-6 bg-surface-hover">
            {track.album.coverImage ? (
              <SafeImage src={track.album.coverImage} alt={track.album.title} fill className="object-cover" priority sizes="224px" fallback={<div className="flex h-full items-center justify-center text-text-muted"><Music className="h-16 w-16" /></div>} />
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted">
                <Music className="h-16 w-16" />
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">{track.title}</h1>
          <Link
            href={`/artist/${track.album.artist.slug}`}
            className="text-lg text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            {track.album.artist.name}
            {track.album.artist.isVerified && (
              <BadgeCheck className="h-4 w-4 text-primary" />
            )}
          </Link>

          <Link
            href={`/album/${track.album.id}`}
            className="mt-1 text-sm text-text-muted hover:text-primary transition-colors"
          >
            {track.album.title}
          </Link>

          <div className="flex items-center gap-4 mt-4 text-sm text-text-secondary">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(track.duration)}
            </span>
            <span className="flex items-center gap-1">
              <Headphones className="h-4 w-4" />
              {formatNumber(track.playCount)} écoutes
            </span>
            {track.isExplicit && (
              <span className="px-2 py-0.5 rounded-sm bg-red-500/10 text-red-500 text-xs font-semibold">EXPLICIT</span>
            )}
          </div>
        </div>

        <div className="text-center">
          <Link
            href={`/album/${track.album.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
          >
            <Music className="h-5 w-5" />
            Écouter sur l&apos;album
          </Link>
        </div>
      </div>
    </div>
  );
}

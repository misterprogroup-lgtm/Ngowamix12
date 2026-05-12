import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Clock, ShoppingBag, Music, Crown, Heart, Download, BadgeCheck, Headphones } from 'lucide-react';
import { TrackRow } from '@/components/catalog/track-row';
import { TrackList } from '@/components/catalog/track-list';
import { AlbumActions } from '@/components/catalog/album-actions';
import { ReviewsSection } from '@/components/catalog/reviews-section';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShareButtons } from '@/components/catalog/share-buttons';
import { formatDuration, formatPrice } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth';
import { PREMIUM_PRICE } from '@/lib/constants';

interface AlbumPageProps {
  params: Promise<{ id: string }>;
}

async function getAlbum(id: string) {
  try {
    const res = await fetch(
      `${process.env.APP_URL || 'http://localhost:3000'}/api/albums/${id}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.album || null;
  } catch {
    return null;
  }
}

async function getAlbumTracks(albumId: string) {
  try {
    const res = await fetch(
      `${process.env.APP_URL || 'http://localhost:3000'}/api/tracks?albumId=${albumId}&limit=50`,
      { next: { revalidate: 300 } }
    );
    const data = await res.json();
    return data.tracks || [];
  } catch {
    return [];
  }
}

async function checkPurchase(albumId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const res = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/user/purchases`, {
      cache: 'no-store',
    });

    if (!res.ok) return false;
    const data = await res.json();
    return data.purchases?.some((p: any) => p.albumId === albumId) || false;
  } catch {
    return false;
  }
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { id } = await params;
  const album = await getAlbum(id);

  if (!album) {
    notFound();
  }

  const tracks = await getAlbumTracks(id);
  const isPurchased = await checkPurchase(id);
  const totalDuration = tracks.reduce((sum: number, track: any) => sum + track.duration, 0);

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="shrink-0 w-full md:w-auto">
          <div className="relative w-full max-w-md mx-auto md:mx-0 md:w-auto aspect-square md:h-72 md:w-72 rounded-xl overflow-hidden shadow-2xl">
            {album.coverImage ? (
              <Image
                src={album.coverImage}
                alt={album.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-surface text-text-muted">
                <Music className="h-20 w-20" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {album.type === 'SINGLE' && (
              <Badge variant="success">Gratuit</Badge>
            )}
            {album.type === 'EP' && (
              <Badge variant="secondary">EP</Badge>
            )}
            <Badge variant="secondary">{album.genre || 'Musique'}</Badge>
            {album.isPremiumOnly && (
              <Badge variant="premium">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
            {isPurchased && (
              <Badge variant="success">
                <ShoppingBag className="h-3 w-3 mr-1" />
                Acheté
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{album.title}</h1>
          <div className="flex items-center gap-1.5 mb-4">
            <Link
              href={`/artist/${album.artist.slug}`}
              className="text-lg text-text-secondary hover:text-primary transition-colors inline-block"
            >
              {album.artist.name}
            </Link>
            {album.artist.isVerified && (
              <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-6">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(totalDuration)}
            </span>
            <span>{album.totalTracks} titre{album.totalTracks !== 1 ? 's' : ''}</span>
            {album.releaseDate && (
              <span>
                {new Date(album.releaseDate).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                })}
              </span>
            )}
            {album.country && <span>{album.country}</span>}
          </div>

          <AlbumActions
            album={{
              id: album.id,
              title: album.title,
              type: album.type,
              price: album.price,
              isPremiumOnly: album.isPremiumOnly,
              coverImage: album.coverImage,
              artist: album.artist,
            }}
            tracks={tracks}
            isPurchased={isPurchased}
          />

          {album.playCount > 0 && (
            <p className="text-sm text-text-muted mt-3 flex items-center gap-1">
              <Headphones className="h-4 w-4" />
              {album.playCount.toLocaleString('fr-FR')} écoutes
            </p>
          )}

          <div className="mt-4">
            <ShareButtons
              url={`/album/${album.id}`}
              title={album.title}
              description={`${album.artist.name} — ${album.type === 'SINGLE' ? 'Single' : album.type === 'EP' ? 'EP' : 'Album'}`}
            />
          </div>

          {album.description && (
            <p className="text-text-secondary mt-6 max-w-2xl">
              {album.description}
            </p>
          )}
        </div>
      </div>

      {tracks.length > 0 ? (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Liste des titres
          </h2>
          <div className="space-y-1">
            <TrackList tracks={tracks} />
          </div>
        </section>
      ) : (
        <div className="text-center py-16">
          <Music className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary">Aucune piste disponible pour cet album</p>
        </div>
      )}

      <ReviewsSection albumId={id} />
    </div>
  );
}

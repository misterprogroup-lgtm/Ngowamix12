'use client';

import { useState } from 'react';
import { AlbumCard } from '@/components/catalog/album-card';
import { cn } from '@/lib/utils';

interface DiscographyAlbum {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  type: string;
  price: number;
  isPremiumOnly: boolean;
  averageRating: number;
  totalReviews: number;
  artist: { name: string; slug: string; isVerified: boolean };
}

interface ArtistDiscographyProps {
  albums: DiscographyAlbum[];
  singles: DiscographyAlbum[];
  artistName: string;
  artistSlug: string;
}

export function ArtistDiscography({ albums, singles, artistName, artistSlug }: ArtistDiscographyProps) {
  const [tab, setTab] = useState<'all' | 'albums' | 'singles'>('all');

  const items = tab === 'singles' ? singles : tab === 'albums' ? albums : [...albums, ...singles];
  const tabs = [
    { key: 'all' as const, label: 'Tout', count: albums.length + singles.length },
    { key: 'albums' as const, label: 'Albums', count: albums.length },
    { key: 'singles' as const, label: 'Singles', count: singles.length },
  ].filter(t => t.count > 0);

  if (tabs.length <= 1) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-6">Discographie</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {items.map((album) => (
            <AlbumCard
              key={album.id}
              id={album.id}
              title={album.title}
              slug={album.slug}
              coverImage={album.coverImage}
              artistName={artistName}
              artistSlug={artistSlug}
              price={Number(album.price)}
              isPremiumOnly={album.isPremiumOnly}
              type={album.type as any}
              averageRating={album.averageRating}
              totalReviews={album.totalReviews}
              isArtistVerified={album.artist.isVerified}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Discographie</h2>
      <div className="flex gap-1 mb-6 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors relative',
              tab === t.key ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {t.label}
            <span className="ml-1.5 text-xs opacity-60">({t.count})</span>
            {tab === t.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {items.map((album) => (
            <AlbumCard
              key={album.id}
              id={album.id}
              title={album.title}
              slug={album.slug}
              coverImage={album.coverImage}
              artistName={artistName}
              artistSlug={artistSlug}
              price={Number(album.price)}
              isPremiumOnly={album.isPremiumOnly}
              type={album.type as any}
              averageRating={album.averageRating}
              totalReviews={album.totalReviews}
              isArtistVerified={album.artist.isVerified}
            />
          ))}
        </div>
      ) : (
        <p className="text-text-secondary text-center py-8 text-sm">Aucun {tab === 'singles' ? 'single' : 'album'} publié</p>
      )}
    </section>
  );
}

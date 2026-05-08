'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Music, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { formatDuration } from '@/lib/utils';

export default function LibraryPage() {
  const [favorites, setFavorites] = useState<{ tracks: any[]; albums: any[] }>({ tracks: [], albums: [] });
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tracks');

  useEffect(() => {
    fetch('/api/user/favorites')
      .then((res) => res.json())
      .then((data) => {
        setFavorites({ tracks: data.tracks || [], albums: data.albums || [] });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleFavorite = async (trackId?: string, albumId?: string) => {
    try {
      await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId, albumId }),
      });
      window.location.reload();
    } catch (error) {
      console.error('Toggle favorite error:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-32 bg-surface-hover rounded" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-surface-hover rounded" />
          ))}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'tracks', label: 'Titres', icon: <Music className="h-4 w-4" /> },
    { id: 'albums', label: 'Albums', icon: <Heart className="h-4 w-4" /> },
  ];

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Heart className="h-6 w-6 text-primary" />
        Ma bibliothèque
      </h1>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

      {activeTab === 'tracks' && (
        favorites.tracks.length === 0 ? (
          <div className="text-center py-16">
            <Music className="h-16 w-16 text-text-muted mx-auto mb-4 opacity-50" />
            <h2 className="text-lg font-medium text-text-secondary mb-2">
              Aucun favori
            </h2>
            <p className="text-text-muted">
              Ajoutez des titres à vos favoris pour les retrouver ici
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {favorites.tracks.map((fav) => (
              <div
                key={fav.id}
                className="flex items-center gap-4 rounded-lg px-3 py-2 hover:bg-surface-hover transition-colors"
              >
                <span className="text-sm text-text-muted w-6 text-right">
                  {fav.track.trackNumber}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {fav.track.title}
                  </p>
                  <p className="text-xs text-text-secondary truncate">
                    {fav.track.album.artist.name} — {fav.track.album.title}
                  </p>
                </div>
                <button
                  onClick={() => toggleFavorite(fav.trackId)}
                  className="text-primary hover:scale-110 transition-transform"
                >
                  <Heart className="h-4 w-4" fill="currentColor" />
                </button>
                <span className="text-sm text-text-muted w-10 text-right">
                  {formatDuration(fav.track.duration)}
                </span>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'albums' && (
        favorites.albums.length === 0 ? (
          <div className="text-center py-16">
            <Music className="h-16 w-16 text-text-muted mx-auto mb-4 opacity-50" />
            <h2 className="text-lg font-medium text-text-secondary mb-2">
              Aucun album favori
            </h2>
            <p className="text-text-muted">
              Ajoutez des albums à vos favoris pour les retrouver ici
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favorites.albums.map((fav) => (
              <div key={fav.id} className="group">
                <Link href={`/album/${fav.album.id}`} className="block relative aspect-square rounded-lg overflow-hidden bg-surface-hover mb-2">
                  {fav.album.coverImage ? (
                    <img
                      src={fav.album.coverImage}
                      alt={fav.album.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-text-muted">
                      <Music className="h-10 w-10" />
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.preventDefault(); toggleFavorite(undefined, fav.albumId); }}
                    className="absolute top-2 right-2 text-primary hover:scale-110 transition-transform"
                  >
                    <Heart className="h-5 w-5" fill="currentColor" />
                  </button>
                </Link>
                <Link href={`/album/${fav.album.id}`}>
                  <p className="text-sm font-medium truncate hover:text-primary transition-colors">
                    {fav.album.title}
                  </p>
                </Link>
                <Link href={`/artist/${fav.album.artist.slug}`}>
                  <p className="text-xs text-text-secondary truncate hover:text-primary transition-colors">
                    {fav.album.artist.name}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Music, User } from 'lucide-react';
import Link from 'next/link';
import { AlbumCard } from '@/components/catalog/album-card';
import { ArtistCard } from '@/components/catalog/artist-card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDuration } from '@/lib/utils';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<{ albums: any[]; artists: any[]; tracks: any[] }>({
    albums: [],
    artists: [],
    tracks: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const [albumsRes, artistsRes, tracksRes] = await Promise.all([
          fetch(`/api/albums?limit=12`),
          fetch(`/api/artists?limit=12`),
          fetch(`/api/tracks?limit=20`),
        ]);

        const [albumsData, artistsData, tracksData] = await Promise.all([
          albumsRes.json(),
          artistsRes.json(),
          tracksRes.json(),
        ]);

        const lowerQuery = query.toLowerCase();

        const filteredAlbums = (albumsData.albums || []).filter(
          (album: any) =>
            album.title.toLowerCase().includes(lowerQuery) ||
            album.artist.name.toLowerCase().includes(lowerQuery)
        );

        const filteredArtists = (artistsData.artists || []).filter(
          (artist: any) => artist.name.toLowerCase().includes(lowerQuery)
        );

        const filteredTracks = (tracksData.tracks || []).filter(
          (track: any) => track.title.toLowerCase().includes(lowerQuery)
        );

        setResults({
          albums: filteredAlbums,
          artists: filteredArtists,
          tracks: filteredTracks,
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [query]);

  const totalResults = results.albums.length + results.artists.length + results.tracks.length;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-16 pb-24 text-center">
        <Search className="h-16 w-16 text-text-muted mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Rechercher</h1>
        <p className="text-text-secondary">
          Tapez le nom d&apos;un artiste, d&apos;un album ou d&apos;un titre
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <h1 className="text-2xl font-bold mb-2">
        Résultats pour &quot;{query}&quot;
      </h1>
      <p className="text-text-secondary mb-8">
        {totalResults} résultat{totalResults !== 1 ? 's' : ''} trouvé{totalResults !== 1 ? 's' : ''}
      </p>

      {totalResults === 0 ? (
        <div className="text-center py-16">
          <Music className="h-16 w-16 text-text-muted mx-auto mb-4" />
          <p className="text-lg text-text-secondary">Aucun résultat</p>
          <p className="text-text-muted mt-2">Essayez avec d&apos;autres termes</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Artists */}
          {results.artists.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Artistes ({results.artists.length})
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
                {results.artists.map((artist: any) => (
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
            </section>
          )}

          {/* Albums */}
          {results.albums.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                Albums ({results.albums.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {results.albums.map((album: any) => (
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
                    isArtistVerified={album.artist?.isVerified}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Tracks */}
          {results.tracks.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Music className="h-5 w-5 text-primary" />
                Titres ({results.tracks.length})
              </h2>
              <div className="space-y-1">
                {results.tracks.map((track: any, index: number) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-4 rounded-lg px-3 py-2 hover:bg-surface-hover transition-colors"
                  >
                    <span className="text-sm text-text-muted w-6 text-right">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {track.title}
                      </p>
                      <p className="text-xs text-text-secondary truncate">
                        {track.album.artist.name} — {track.album.title}
                      </p>
                    </div>
                    <span className="text-sm text-text-muted">
                      {formatDuration(track.duration)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

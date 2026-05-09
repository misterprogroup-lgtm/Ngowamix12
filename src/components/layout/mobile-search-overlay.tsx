'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, Music, User, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDuration } from '@/lib/utils';

interface SearchResults {
  albums: any[];
  artists: any[];
  tracks: any[];
}

export function MobileSearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    albums: [],
    artists: [],
    tracks: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
    if (!open) {
      setQuery('');
      setResults({ albums: [], artists: [], tracks: [] });
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ albums: [], artists: [], tracks: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [albumsRes, artistsRes, tracksRes] = await Promise.all([
          fetch(`/api/albums?limit=20`),
          fetch(`/api/artists?limit=20`),
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
          (track: any) =>
            track.title.toLowerCase().includes(lowerQuery) ||
            track.album?.title?.toLowerCase().includes(lowerQuery) ||
            track.album?.artist?.name?.toLowerCase().includes(lowerQuery)
        );

        setResults({
          albums: filteredAlbums,
          artists: filteredArtists,
          tracks: filteredTracks,
        });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = () => {
    onClose();
  };

  const totalResults = results.albums.length + results.artists.length + results.tracks.length;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/10" onClick={onClose} />
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <div className="w-full max-w-lg bg-background rounded-2xl shadow-xl overflow-hidden pointer-events-auto">
              <div className="p-4 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Artistes, albums, titres..."
                    className="w-full h-12 pl-10 pr-12 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  />
                </div>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[50vh] overflow-y-auto">
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}

                {!loading && query && totalResults === 0 && (
                  <div className="text-center py-16">
                    <Search className="h-12 w-12 text-text-muted mx-auto mb-3" />
                    <p className="text-text-secondary text-sm">Aucun résultat pour &quot;{query}&quot;</p>
                  </div>
                )}

                {!loading && !query && (
                  <div className="text-center py-16">
                    <Search className="h-12 w-12 text-text-muted mx-auto mb-3" />
                    <p className="text-text-secondary text-sm">Recherchez un artiste, un album ou un titre</p>
                  </div>
                )}

                {!loading && totalResults > 0 && (
                  <div className="px-4 py-3 space-y-6">
                    {results.artists.length > 0 && (
                      <section>
                        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                          Artistes ({results.artists.length})
                        </h3>
                        <div className="space-y-1">
                          {results.artists.map((artist: any) => (
                            <Link
                              key={artist.id}
                              href={`/artist/${artist.slug}`}
                              onClick={handleResultClick}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors"
                            >
                              <div className="h-10 w-10 rounded-full bg-surface-hover overflow-hidden shrink-0 flex items-center justify-center">
                                {artist.avatar ? (
                                  <img src={artist.avatar} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <User className="h-5 w-5 text-text-muted" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate">
                                  {artist.name}
                                </p>
                                <p className="text-xs text-text-muted">Artiste</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </section>
                    )}

                    {results.albums.length > 0 && (
                      <section>
                        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                          Albums ({results.albums.length})
                        </h3>
                        <div className="space-y-1">
                          {results.albums.map((album: any) => (
                            <Link
                              key={album.id}
                              href={`/album/${album.id}`}
                              onClick={handleResultClick}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors"
                            >
                              <div className="h-10 w-10 rounded-md bg-surface-hover overflow-hidden shrink-0 flex items-center justify-center">
                                {album.coverImage ? (
                                  <img src={album.coverImage} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <Music className="h-5 w-5 text-text-muted" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-text-primary truncate">
                                  {album.title}
                                </p>
                                <p className="text-xs text-text-secondary truncate">
                                  {album.artist.name}
                                  {album.type === 'SINGLE' && ' • Single'}
                                  {album.type === 'EP' && ' • EP'}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </section>
                    )}

                    {results.tracks.length > 0 && (
                      <section>
                        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                          Titres ({results.tracks.length})
                        </h3>
                        <div className="space-y-1">
                          {results.tracks.map((track: any) => (
                            <Link
                              key={track.id}
                              href={`/album/${track.albumId}`}
                              onClick={handleResultClick}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors"
                            >
                              <div className="h-10 w-10 rounded-md bg-surface-hover overflow-hidden shrink-0 flex items-center justify-center">
                                {track.album?.coverImage ? (
                                  <img src={track.album.coverImage} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <Music className="h-5 w-5 text-text-muted" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-text-primary truncate">
                                  {track.title}
                                </p>
                                <p className="text-xs text-text-secondary truncate">
                                  {track.album?.artist?.name}
                                </p>
                              </div>
                              <span className="text-xs text-text-muted shrink-0 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(track.duration)}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

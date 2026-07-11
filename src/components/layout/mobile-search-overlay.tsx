'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { useRouter } from 'next/navigation';
import { Search, X, Music, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MusicList } from '@/components/track/music-list';
import { usePlayerStore } from '@/store/player-store';

interface SearchAlbum {
  id: string;
  title: string;
  coverImage: string | null;
  type: string;
  artist: { name: string };
}

interface SearchArtist {
  id: string;
  slug: string;
  name: string;
  avatar: string | null;
}

interface SearchTrack {
  id: string;
  title: string;
  duration: number;
  album: { id: string; title?: string; coverImage: string | null; artist: { name: string } };
}

interface SearchResults {
  albums: SearchAlbum[];
  artists: SearchArtist[];
  tracks: SearchTrack[];
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
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        setResults({
          albums: data.albums || [],
          artists: data.artists || [],
          tracks: data.tracks || [],
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
        <div className="fixed inset-0 z-60 md:hidden animate-fadeIn">
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <div className="absolute top-0 left-0 right-0 p-4 pt-16 pointer-events-none">
            <div className="w-full max-w-lg mx-auto bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-white/20 animate-slideDown">
              <div className="p-4 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Artistes, albums, titres..."
                    className="w-full h-12 pl-10 pr-12 rounded-xl bg-white/30 dark:bg-black/30 backdrop-blur-md border border-white/30 text-white placeholder:text-white/50 text-sm outline-hidden focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[50vh] overflow-y-auto px-1">
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}

                {!loading && query && totalResults === 0 && (
                  <div className="text-center py-16">
                    <Search className="h-12 w-12 text-white/50 mx-auto mb-3" />
                    <p className="text-white/80 text-sm">Aucun résultat pour &quot;{query}&quot;</p>
                  </div>
                )}

                {!loading && !query && (
                  <div className="text-center py-16">
                    <Search className="h-12 w-12 text-white/50 mx-auto mb-3" />
                    <p className="text-white/80 text-sm">Recherchez un artiste, un album ou un titre</p>
                  </div>
                )}

                {!loading && totalResults > 0 && (
                  <div className="px-4 py-3 space-y-6">
                    {results.artists.length > 0 && (
                      <section>
                        <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                          Artistes ({results.artists.length})
                        </h3>
                        <div className="space-y-1">
                          {results.artists.map((artist: SearchArtist) => (
                            <Link
                              key={artist.id}
                              href={`/artist/${artist.slug}`}
                              onClick={handleResultClick}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
                            >
                              <div className="relative h-10 w-10 rounded-full bg-white/20 dark:bg-black/20 overflow-hidden shrink-0">
                                {artist.avatar ? (
                                  <SafeImage src={artist.avatar} alt="" fill sizes="40px" className="object-cover" fallback={<User className="h-5 w-5 text-white/50" />} />
                                ) : (
                                  <User className="h-5 w-5 text-white/50" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {artist.name}
                                </p>
                                <p className="text-xs text-white/50">Artiste</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </section>
                    )}

                    {results.albums.length > 0 && (
                      <section>
                        <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                          Albums ({results.albums.length})
                        </h3>
                        <div className="space-y-1">
                          {results.albums.map((album: SearchAlbum) => (
                            <Link
                              key={album.id}
                              href={`/album/${album.id}`}
                              onClick={handleResultClick}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
                            >
                              <div className="relative h-10 w-10 rounded-md bg-white/20 dark:bg-black/20 overflow-hidden shrink-0">
                                {album.coverImage ? (
                                  <SafeImage src={album.coverImage} alt="" fill sizes="40px" className="object-cover" fallback={<Music className="h-5 w-5 text-white/50" />} />
                                ) : (
                                  <Music className="h-5 w-5 text-white/50" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-white truncate">
                                  {album.title}
                                </p>
                                <p className="text-xs text-white/80 truncate">
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
                        <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                          Titres ({results.tracks.length})
                        </h3>
                        <MusicList
                          items={results.tracks.map((track) => ({
                            id: track.id,
                            title: track.title,
                            artist: track.album?.artist?.name ?? '',
                            cover: track.album?.coverImage ?? null,
                            duration: track.duration,
                          }))}
                          onPlay={(id) => {
                            const { currentTrack, isPlaying, play, pause } = usePlayerStore.getState();
                            if (currentTrack?.id === id && isPlaying) {
                              pause();
                            } else {
                              const track = results.tracks.find((t) => t.id === id);
                              if (track) {
                                play(
                                  {
                                    id: track.id,
                                    title: track.title,
                                    slug: '',
                                    trackNumber: 0,
                                    duration: track.duration,
                                    audioFile: '',
                                    isExplicit: false,
                                    isPremiumOnly: false,
                                    playCount: 0,
                                    album: {
                                      id: track.album?.id ?? '',
                                      title: track.album?.title ?? '',
                                      coverImage: track.album?.coverImage ?? null,
                                      artist: {
                                        id: '',
                                        name: track.album?.artist?.name ?? '',
                                        slug: '',
                                        avatar: null,
                                      },
                                    },
                                  },
                                  results.tracks.map((t) => ({
                                    id: t.id,
                                    title: t.title,
                                    slug: '',
                                    trackNumber: 0,
                                    duration: t.duration,
                                    audioFile: '',
                                    isExplicit: false,
                                    isPremiumOnly: false,
                                    playCount: 0,
                                    album: {
                                      id: t.album?.id ?? '',
                                      title: t.album?.title ?? '',
                                      coverImage: t.album?.coverImage ?? null,
                                      artist: {
                                        id: '',
                                        name: t.album?.artist?.name ?? '',
                                        slug: '',
                                        avatar: null,
                                      },
                                    },
                                  })),
                                  results.tracks.findIndex((t) => t.id === id),
                                );
                              }
                            }
                            handleResultClick();
                          }}
                          className="!bg-transparent"
                        />
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

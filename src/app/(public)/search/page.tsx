'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Search, Music, User, X } from 'lucide-react';
import Link from 'next/link';
import { AlbumCard } from '@/components/catalog/album-card';
import { ArtistCard } from '@/components/catalog/artist-card';
import { TrackList } from '@/components/catalog/track-list';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Track } from '@/types';

interface AlbumResult {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  type: string;
  price: number;
  isPremiumOnly: boolean;
  artist: { name: string; slug: string; isVerified: boolean };
}

interface ArtistResult {
  id: string;
  name: string;
  slug: string;
  avatar: string | null;
  isVerified: boolean;
}

type Tab = 'tracks' | 'albums' | 'artists';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const tabParam = searchParams.get('tab') as Tab | null;
  const [input, setInput] = useState(query);
  const [activeTab, setActiveTab] = useState<Tab>(tabParam || 'tracks');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<AlbumResult[]>([]);
  const [artists, setArtists] = useState<ArtistResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalResults = tracks.length + albums.length + artists.length;

  useEffect(() => {
    setInput(query);
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setTracks([]);
      setAlbums([]);
      setArtists([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=20`);
        const data = await res.json();
        setTracks(data.tracks || []);
        setAlbums(data.albums || []);
        setArtists(data.artists || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      router.push(`/search?q=${encodeURIComponent(input.trim())}`);
    }
  };

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    router.replace(`/search?q=${encodeURIComponent(query)}&tab=${tab}`, { scroll: false });
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'tracks', label: 'Titres', count: tracks.length },
    { key: 'albums', label: 'Albums', count: albums.length },
    { key: 'artists', label: 'Artistes', count: artists.length },
  ];

  const emptyState = !loading && query && totalResults === 0;
  const noQuery = !query;

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      {/* Search bar */}
      <form onSubmit={handleSubmit} className="relative max-w-xl mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Artistes, albums, titres..."
          className="w-full h-12 pl-12 pr-12 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm outline-hidden focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
        {input && (
          <button
            type="button"
            onClick={() => { setInput(''); router.push('/search'); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {noQuery && (
        <div className="text-center py-16">
          <Search className="h-16 w-16 text-text-muted mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Rechercher</h1>
          <p className="text-text-secondary">
            Tapez le nom d&apos;un artiste, d&apos;un album ou d&apos;un titre
          </p>
        </div>
      )}

      {loading && (
        <div>
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-10 w-80 mb-6" />
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
      )}

      {emptyState && (
        <div className="text-center py-16">
          <Music className="h-16 w-16 text-text-muted mx-auto mb-4" />
          <p className="text-lg text-text-secondary">Aucun résultat pour &quot;{query}&quot;</p>
          <p className="text-text-muted mt-2">Vérifiez l&apos;orthographe ou essayez d&apos;autres termes</p>
        </div>
      )}

      {!loading && query && totalResults > 0 && (
        <>
          <h1 className="text-2xl font-bold mb-1">Résultats pour &quot;{query}&quot;</h1>
          <p className="text-sm text-text-secondary mb-6">
            {totalResults} résultat{totalResults !== 1 ? 's' : ''} trouvé{totalResults !== 1 ? 's' : ''}
          </p>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => switchTab(tab.key)}
                className={cn(
                  'px-4 py-3 text-sm font-medium transition-colors relative',
                  activeTab === tab.key
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {tab.label}
                <span className="ml-1.5 text-xs opacity-60">({tab.count})</span>
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tracks tab */}
          {activeTab === 'tracks' && (
            <section>
              {tracks.length > 0 ? (
                <TrackList tracks={tracks} />
              ) : (
                <p className="text-text-secondary text-center py-8">Aucun titre trouvé</p>
              )}
            </section>
          )}

          {/* Albums tab */}
          {activeTab === 'albums' && (
            <section>
              {albums.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {albums.map((album) => (
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
                      type={album.type as any}
                      isArtistVerified={album.artist.isVerified}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary text-center py-8">Aucun album trouvé</p>
              )}
            </section>
          )}

          {/* Artists tab */}
          {activeTab === 'artists' && (
            <section>
              {artists.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
                  {artists.map((artist) => (
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
              ) : (
                <p className="text-text-secondary text-center py-8">Aucun artiste trouvé</p>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  );
}

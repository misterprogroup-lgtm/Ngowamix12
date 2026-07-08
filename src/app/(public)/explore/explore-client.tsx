'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { X, ChevronLeft, ChevronRight, Music, Sparkles } from 'lucide-react';
import { AlbumCard } from '@/components/catalog/album-card';
import { ArtistCard } from '@/components/catalog/artist-card';
import { TrackRow } from '@/components/catalog/track-row';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimateOnView } from '@/components/ui/animate-on-view';
import { ListenHistoryPlaylist } from '@/components/catalog/listen-history-playlist';
import { PersonalizedRecommendations } from '@/components/home/personalized-recommendations';
import { GENRES, COUNTRIES } from '@/lib/constants';
import type { Track } from '@/types';

interface ExploreAlbum {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  price: number;
  isPremiumOnly: boolean;
  type: string;
  averageRating: number | null;
  totalReviews: number;
  artist: { name: string; slug: string; isVerified: boolean };
}

interface ExploreArtist {
  id: string;
  name: string;
  slug: string;
  avatar: string | null;
  isVerified: boolean;
}

const typeTabs = [
  { value: 'all', label: 'Tout' },
  { value: 'album', label: 'Albums' },
  { value: 'single', label: 'Singles' },
  { value: 'ep', label: 'EPs' },
  { value: 'artist', label: 'Artistes' },
] as const;

export function ExploreClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<(ExploreAlbum | ExploreArtist | Track)[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  const genre = searchParams.get('genre') || '';
  const country = searchParams.get('country') || '';

  useEffect(() => {
    fetch('/api/user/favorites')
      .then(r => r.json())
      .then(data => setFavoriteIds(new Set(data.favoriteIds || [])))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);

    if (type === 'single') {
      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', '20');
        const res = await fetch(`/api/singles?${params.toString()}`);
        const data = await res.json();
        setItems(data.tracks || []);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Singles fetch error:', error);
      } finally {
        setLoading(false);
      }
      return;
    }

    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '20');
    if (genre) params.set('genre', genre);
    if (country) params.set('country', country);
    if (type === 'album') params.set('type', 'ALBUM');
    if (type === 'ep') params.set('type', 'EP');

    const endpoint = type === 'artist' ? 'artists' : 'albums';

    try {
      const res = await fetch(`/api/${endpoint}?${params.toString()}`);
      const data = await res.json();
      setItems(type === 'artist' ? data.artists : data.albums);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [type, genre, country, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateFilters = (key: string, value: string) => {
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/explore?${params.toString()}`, { scroll: false });
  };

  const setFilterAndReset = (key: string, value: string) => {
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('type', type);
    router.push(`/explore?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <AnimateOnView>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Explorer</h1>
            <p className="text-sm text-text-secondary mt-0.5">
              {genre && <span>{genre}</span>}
              {genre && country && <span> &middot; </span>}
              {country && <span>{country}</span>}
              {!genre && !country && <span>Découvrez toute la musique africaine</span>}
            </p>
          </div>
        </div>
      </AnimateOnView>

      {/* Ma playlist (compact) */}
      <AnimateOnView delay={50}>
        <div className="mb-8">
          <ListenHistoryPlaylist />
        </div>
      </AnimateOnView>

      {/* Recommandations */}
      <AnimateOnView delay={80}>
        <div className="mb-8">
          <PersonalizedRecommendations />
        </div>
      </AnimateOnView>

      {/* Type tabs */}
      <AnimateOnView delay={100}>
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {typeTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setType(tab.value);
                setPage(1);
                router.push(`/explore?type=${tab.value}${genre ? `&genre=${genre}` : ''}${country ? `&country=${country}` : ''}`, { scroll: false });
              }}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                type === tab.value
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-primary/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </AnimateOnView>

      {/* Active filters chips */}
      {(genre || country) && (
        <AnimateOnView delay={120}>
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {genre && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {genre}
                <button onClick={() => { setPage(1); updateFilters('genre', ''); }}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {country && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {country}
                <button onClick={() => { setPage(1); updateFilters('country', ''); }}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setPage(1);
                router.push(`/explore?type=${type}`, { scroll: false });
              }}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              Effacer tout
            </button>
          </div>
        </AnimateOnView>
      )}

      {/* Genre pills */}
      <AnimateOnView delay={130}>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 -mx-4 px-4">
          {GENRES.slice(0, 12).map((g) => (
            <button
              key={g}
              onClick={() => setFilterAndReset('genre', genre === g ? '' : g)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                genre === g
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface border-border text-text-secondary hover:text-text-primary hover:border-text-muted'
              }`}
            >
              {g}
            </button>
          ))}
          <select
            value={country}
            onChange={(e) => setFilterAndReset('country', e.target.value)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-surface border border-border text-text-secondary focus:outline-hidden appearance-none cursor-pointer hover:border-text-muted transition-colors"
            aria-label="Filtrer par pays"
          >
            <option value="">Tous les pays</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </AnimateOnView>

      {/* Results */}
      {loading ? (
        type === 'single' ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-3 py-3">
                <Skeleton className="h-4 w-4 rounded-sm" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24 ml-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        )
      ) : items.length === 0 ? (
        <AnimateOnView delay={150}>
          <div className="text-center py-16">
            <Music className="h-16 w-16 text-text-muted mx-auto mb-4 opacity-50" />
            <p className="text-text-secondary text-lg">Aucun résultat trouvé</p>
            <p className="text-text-muted mt-2">Essayez de modifier vos filtres</p>
          </div>
        </AnimateOnView>
      ) : (
        <>
          {type === 'single' ? (
            <div className="space-y-1">
              {items.map((item, i) => {
                const track = item as Track;
                return (
                  <AnimateOnView key={track.id} delay={i * 30}>
                    <TrackRow
                      track={track}
                      index={i}
                      isPlaying={false}
                      favoriteIds={favoriteIds}
                      onToggleFavorite={(id) => {
                        const next = new Set(favoriteIds);
                        if (next.has(id)) next.delete(id);
                        else next.add(id);
                        setFavoriteIds(next);
                      }}
                    />
                  </AnimateOnView>
                );
              })}
            </div>
          ) : (type === 'all' || type === 'album' || type === 'ep') ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {items.map((item, i) => {
                const a = item as ExploreAlbum;
                return (
                  <AnimateOnView key={a.id} delay={i * 40}>
                    <AlbumCard
                      id={a.id}
                      title={a.title}
                      slug={a.slug}
                      coverImage={a.coverImage}
                      artistName={a.artist.name}
                      artistSlug={a.artist.slug}
                      price={Number(a.price)}
                      isPremiumOnly={a.isPremiumOnly}
                      type={a.type as 'ALBUM' | 'SINGLE' | 'EP' | undefined}
                      averageRating={a.averageRating ?? undefined}
                      totalReviews={a.totalReviews}
                      isArtistVerified={a.artist.isVerified}
                    />
                  </AnimateOnView>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
              {items.map((item, i) => {
                const artist = item as ExploreArtist;
                return (
                  <AnimateOnView key={artist.id} delay={i * 40}>
                    <ArtistCard
                      id={artist.id}
                      name={artist.name}
                      slug={artist.slug}
                      avatar={artist.avatar}
                      isVerified={artist.isVerified}
                    />
                  </AnimateOnView>
                );
              })}
            </div>
          )}

          {/* Pagination avec numéros de page */}
          {pagination.pages > 1 && (
            <AnimateOnView delay={200}>
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="!p-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(pagination.pages, 7) }).map((_, i) => {
                  const pageNum = (() => {
                    if (pagination.pages <= 7) return i + 1;
                    if (page <= 4) return i + 1;
                    if (page >= pagination.pages - 3) return pagination.pages - 6 + i;
                    return page - 3 + i;
                  })();
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`h-8 w-8 rounded-lg text-xs font-medium transition-all ${
                        page === pageNum
                          ? 'bg-primary text-white'
                          : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-primary/30'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === pagination.pages}
                  onClick={() => setPage(page + 1)}
                  className="!p-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </AnimateOnView>
          )}
        </>
      )}
    </div>
  );
}

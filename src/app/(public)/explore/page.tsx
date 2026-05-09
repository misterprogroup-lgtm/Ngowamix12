'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlbumCard } from '@/components/catalog/album-card';
import { ArtistCard } from '@/components/catalog/artist-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ListenHistoryPlaylist } from '@/components/catalog/listen-history-playlist';
import { GENRES, COUNTRIES } from '@/lib/constants';

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  const genre = searchParams.get('genre') || '';
  const country = searchParams.get('country') || '';

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '20');
    if (genre) params.set('genre', genre);
    if (country) params.set('country', country);
    if (type === 'single') params.set('type', 'SINGLE');
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
  };

  useEffect(() => {
    fetchData();
  }, [type, genre, country, page]);

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

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <h1 className="text-3xl font-bold mb-8">
        Explorer le catalogue
      </h1>

      {/* Ma playlist */}
      <ListenHistoryPlaylist />

      {/* Type selector */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={type === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => {
            setType('all');
            router.push('/explore?type=all');
          }}
        >
          Tout
        </Button>
        <Button
          variant={type === 'album' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => {
            setType('album');
            router.push('/explore?type=album');
          }}
        >
          Albums
        </Button>
        <Button
          variant={type === 'single' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => {
            setType('single');
            router.push('/explore?type=single');
          }}
        >
          Singles
        </Button>
        <Button
          variant={type === 'ep' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => {
            setType('ep');
            router.push('/explore?type=ep');
          }}
        >
          EPs
        </Button>
        <Button
          variant={type === 'artist' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => {
            setType('artist');
            router.push('/explore?type=artist');
          }}
        >
          Artistes
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div>
          <label className="text-sm text-text-secondary block mb-1">Genre</label>
          <select
            value={genre}
            onChange={(e) => updateFilters('genre', e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
          >
            <option value="">Tous les genres</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-text-secondary block mb-1">Pays</label>
          <select
            value={country}
            onChange={(e) => updateFilters('country', e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
          >
            <option value="">Tous les pays</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-secondary text-lg">Aucun résultat trouvé</p>
          <p className="text-text-muted mt-2">Essayez de modifier vos filtres</p>
        </div>
      ) : (
        <>
          {(type === 'all' || type === 'album' || type === 'single' || type === 'ep') ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {items.map((album: any) => (
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
                  type={album.type}
                  averageRating={album.averageRating}
                  totalReviews={album.totalReviews}
                  isArtistVerified={album.artist.isVerified}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
              {items.map((artist: any) => (
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
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Précédent
              </Button>
              <span className="text-sm text-text-secondary">
                Page {page} sur {pagination.pages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === pagination.pages}
                onClick={() => setPage(page + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { Heart, Music, Download, WifiOff, Trash2, HardDrive, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { formatDuration, formatFileSize } from '@/lib/utils';
import {
  getAllOfflineTracks,
  getOfflineAlbums,
  removeOfflineAlbum,
  getOfflineStorageInfo,
} from '@/lib/offline-storage';

export default function LibraryPage() {
  const [favorites, setFavorites] = useState<{ tracks: any[]; albums: any[]; artists: any[] }>({ tracks: [], albums: [], artists: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tracks');
  const [offlineAlbums, setOfflineAlbums] = useState<Awaited<ReturnType<typeof getOfflineAlbums>>>([]);
  const [offlineTracks, setOfflineTracks] = useState<Awaited<ReturnType<typeof getAllOfflineTracks>>>([]);
  const [storageInfo, setStorageInfo] = useState({ used: 0, trackCount: 0, albumCount: 0 });
  const [removing, setRemoving] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [favRes, albums, tracks, info] = await Promise.all([
        fetch('/api/user/favorites').then((r) => r.json()),
        getOfflineAlbums(),
        getAllOfflineTracks(),
        getOfflineStorageInfo(),
      ]);
      setFavorites({ tracks: favRes.tracks || [], albums: favRes.albums || [], artists: favRes.artists || [] });
      setOfflineAlbums(albums);
      setOfflineTracks(tracks);
      setStorageInfo(info);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemoveOffline = async (albumId: string) => {
    setRemoving(albumId);
    await removeOfflineAlbum(albumId);
    await loadData();
    setRemoving(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 pb-24">
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
    { id: 'artists', label: 'Artistes', icon: <UserPlus className="h-4 w-4" /> },
    { id: 'offline', label: 'Hors-ligne', icon: <WifiOff className="h-4 w-4" /> },
  ];

  return (
    <div className="container mx-auto py-8 pb-24">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Heart className="h-6 w-6 text-primary" />
        Ma bibliothèque
      </h1>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

      {activeTab === 'tracks' && (
        favorites.tracks.length === 0 ? (
          <div className="text-center py-16">
            <Music className="h-16 w-16 text-text-muted mx-auto mb-4 opacity-50" />
            <h2 className="text-lg font-medium text-text-secondary mb-2">Aucun favori</h2>
            <p className="text-text-muted">Ajoutez des titres à vos favoris pour les retrouver ici</p>
          </div>
        ) : (
          <div className="space-y-1">
            {favorites.tracks.map((fav: any) => (
              <div key={fav.id} className="flex items-center gap-4 rounded-lg px-3 py-2 hover:bg-surface-hover transition-colors">
                <span className="text-sm text-text-muted w-6 text-right">{fav.track.trackNumber}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{fav.track.title}</p>
                  <p className="text-xs text-text-secondary truncate">{fav.track.album.artist.name} — {fav.track.album.title}</p>
                </div>
                <button onClick={() => { fetch('/api/user/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackId: fav.trackId }) }).then(() => window.location.reload()); }} className="text-primary hover:scale-110 transition-transform">
                  <Heart className="h-4 w-4" fill="currentColor" />
                </button>
                <span className="text-sm text-text-muted w-10 text-right">{formatDuration(fav.track.duration)}</span>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'albums' && (
        favorites.albums.length === 0 ? (
          <div className="text-center py-16">
            <Music className="h-16 w-16 text-text-muted mx-auto mb-4 opacity-50" />
            <h2 className="text-lg font-medium text-text-secondary mb-2">Aucun album favori</h2>
            <p className="text-text-muted">Ajoutez des albums à vos favoris pour les retrouver ici</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favorites.albums.map((fav: any) => (
              <div key={fav.id} className="group">
                <Link href={`/album/${fav.album.id}`} className="block relative aspect-square rounded-lg overflow-hidden bg-surface-hover mb-2">
                  {fav.album.coverImage ? (
                    <SafeImage src={fav.album.coverImage} alt={fav.album.title} fill className="object-cover group-hover:scale-105 transition-transform" sizes="(max-width: 640px) 50vw, 20vw" fallback={<div className="flex h-full items-center justify-center text-text-muted"><Music className="h-10 w-10" /></div>} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-text-muted"><Music className="h-10 w-10" /></div>
                  )}
                  <button onClick={(e) => { e.preventDefault(); fetch('/api/user/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ albumId: fav.albumId }) }).then(() => window.location.reload()); }} className="absolute top-2 right-2 text-primary hover:scale-110 transition-transform">
                    <Heart className="h-5 w-5" fill="currentColor" />
                  </button>
                </Link>
                <Link href={`/album/${fav.album.id}`}><p className="text-sm font-medium truncate hover:text-primary transition-colors">{fav.album.title}</p></Link>
                <Link href={`/artist/${fav.album.artist.slug}`}><p className="text-xs text-text-secondary truncate hover:text-primary transition-colors">{fav.album.artist.name}</p></Link>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'artists' && (
        favorites.artists.length === 0 ? (
          <div className="text-center py-16">
            <UserPlus className="h-16 w-16 text-text-muted mx-auto mb-4 opacity-50" />
            <h2 className="text-lg font-medium text-text-secondary mb-2">Aucun artiste suivi</h2>
            <p className="text-text-muted">Suivez des artistes pour voir leurs nouveautés ici</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favorites.artists.map((fav: any) => (
              <div key={fav.id} className="group">
                <Link href={`/artist/${fav.artist.slug}`} className="block relative aspect-square rounded-lg overflow-hidden bg-surface-hover mb-2">
                  {fav.artist.avatar ? (
                    <SafeImage src={fav.artist.avatar} alt={fav.artist.name} fill className="object-cover group-hover:scale-105 transition-transform" sizes="(max-width: 640px) 50vw, 20vw" fallback={<div className="flex h-full items-center justify-center text-text-muted"><Music className="h-10 w-10" /></div>} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-text-muted"><Music className="h-10 w-10" /></div>
                  )}
                  <button onClick={(e) => { e.preventDefault(); fetch('/api/user/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ artistId: fav.artistId }) }).then(() => window.location.reload()); }} className="absolute top-2 right-2 text-primary hover:scale-110 transition-transform">
                    <Heart className="h-5 w-5" fill="currentColor" />
                  </button>
                </Link>
                <Link href={`/artist/${fav.artist.slug}`}><p className="text-sm font-medium truncate hover:text-primary transition-colors">{fav.artist.name}</p></Link>
                {fav.artist.bio && <p className="text-xs text-text-secondary truncate">{fav.artist.bio.substring(0, 60)}</p>}
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'offline' && (
        offlineAlbums.length === 0 ? (
          <div className="text-center py-16">
            <WifiOff className="h-16 w-16 text-text-muted mx-auto mb-4 opacity-50" />
            <h2 className="text-lg font-medium text-text-secondary mb-2">Aucun contenu hors-ligne</h2>
            <p className="text-text-muted mb-6">Téléchargez des albums pour les écouter sans connexion internet</p>
            <Link href="/explore">
              <Button variant="primary">Explorer le catalogue</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4 text-sm text-text-secondary">
              <HardDrive className="h-4 w-4" />
              {formatFileSize(storageInfo.used)} utilisés · {storageInfo.trackCount} titres · {storageInfo.albumCount} albums
            </div>
            <div className="space-y-3">
              {offlineAlbums.map((album) => (
                <div key={album.albumId} className="rounded-xl border border-border p-4 flex items-center gap-4">
                  {album.albumCover ? (
                    <div className="relative h-16 w-16 shrink-0">
                      <SafeImage src={album.albumCover} alt={album.albumTitle} fill className="rounded-lg object-cover" sizes="64px" fallback={<div className="h-16 w-16 rounded-lg bg-surface-hover flex items-center justify-center shrink-0"><Music className="h-6 w-6 text-text-muted" /></div>} />
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-surface-hover flex items-center justify-center shrink-0"><Music className="h-6 w-6 text-text-muted" /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link href={`/album/${album.albumId}`} className="font-medium hover:text-primary transition-colors">{album.albumTitle}</Link>
                    <p className="text-sm text-text-secondary">{album.artistName} · {album.trackCount} titres · {formatFileSize(album.totalSize)}</p>
                  </div>
                  <Badge variant="success" className="shrink-0">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Hors-ligne
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveOffline(album.albumId)} isLoading={removing === album.albumId}>
                    <Trash2 className="h-4 w-4 text-error" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )
      )}
    </div>
  );
}

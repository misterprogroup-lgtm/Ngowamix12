'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Music, HardDrive, Trash2, Disc3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatFileSize, formatDate } from '@/lib/utils';
import {
  getAllOfflineTracks,
  getOfflineAlbums,
  removeOfflineTrack,
  removeOfflineAlbum,
  getOfflineStorageInfo,
} from '@/lib/offline-storage';

export function OfflineManager() {
  const [albums, setAlbums] = useState<Awaited<ReturnType<typeof getOfflineAlbums>>>([]);
  const [tracks, setTracks] = useState<Awaited<ReturnType<typeof getAllOfflineTracks>>>([]);
  const [storage, setStorage] = useState({ used: 0, trackCount: 0, albumCount: 0 });
  const [view, setView] = useState<'albums' | 'tracks'>('albums');

  const refresh = async () => {
    const [a, t, s] = await Promise.all([
      getOfflineAlbums(),
      getAllOfflineTracks(),
      getOfflineStorageInfo(),
    ]);
    setAlbums(a);
    setTracks(t);
    setStorage(s);
  };

  useEffect(() => {
    refresh();
  }, []);

  const removeTrack = async (trackId: string) => {
    await removeOfflineTrack(trackId);
    refresh();
  };

  const removeAlbum = async (albumId: string) => {
    await removeOfflineAlbum(albumId);
    refresh();
  };

  return (
    <div className="space-y-6">
      {/* Storage info */}
      <div className="rounded-xl border border-border p-4 flex items-center gap-4">
        <HardDrive className="h-8 w-8 text-primary" />
        <div>
          <p className="text-sm font-medium">Stockage utilisé</p>
          <p className="text-xs text-text-muted">
            {formatFileSize(storage.used)} &middot; {storage.trackCount} titre{storage.trackCount !== 1 ? 's' : ''}
            {storage.albumCount > 0 && ` &middot; ${storage.albumCount} album${storage.albumCount !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        <Button
          variant={view === 'albums' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setView('albums')}
        >
          <Disc3 className="h-4 w-4 mr-1" />
          Albums
        </Button>
        <Button
          variant={view === 'tracks' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setView('tracks')}
        >
          <Music className="h-4 w-4 mr-1" />
          Titres
        </Button>
      </div>

      {view === 'albums' && (
        <div className="space-y-3">
          {albums.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <Music className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucun album téléchargé</p>
            </div>
          ) : (
            albums.map((album) => (
              <div key={album.albumId} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {album.albumCover ? (
                    <img src={album.albumCover} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Disc3 className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/album/${album.artistSlug}/${album.albumId}`} className="font-medium text-sm hover:text-primary truncate block">
                    {album.albumTitle}
                  </Link>
                  <p className="text-xs text-text-muted">
                    {album.artistName} &middot; {album.trackCount} titre{album.trackCount !== 1 ? 's' : ''} &middot; {formatFileSize(album.totalSize)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAlbum(album.albumId)}
                  className="text-text-muted hover:text-error flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {view === 'tracks' && (
        <div className="space-y-2">
          {tracks.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <Music className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucun titre téléchargé</p>
            </div>
          ) : (
            tracks.map((track) => (
              <div key={track.trackId} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Music className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{track.title}</p>
                  <p className="text-xs text-text-muted">
                    {track.artistName} &middot; {formatFileSize(track.size)}
                  </p>
                </div>
                <span className="text-xs text-text-muted flex-shrink-0">
                  {formatDate(new Date(track.downloadedAt))}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTrack(track.trackId)}
                  className="text-text-muted hover:text-error flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

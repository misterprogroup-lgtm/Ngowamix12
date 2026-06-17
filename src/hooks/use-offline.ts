'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  isTrackOffline,
  isAlbumOffline,
  getAllOfflineTracks,
  getOfflineAlbums,
} from '@/lib/offline-storage';

export function useOfflineStatus(trackId?: string, albumId?: string) {
  const [trackOffline, setTrackOffline] = useState(false);
  const [albumTracks, setAlbumTracks] = useState<string[]>([]);

  useEffect(() => {
    if (trackId) {
      isTrackOffline(trackId).then(setTrackOffline);
    }
  }, [trackId]);

  useEffect(() => {
    if (albumId) {
      getAllOfflineTracks().then((tracks) => {
        const ids = tracks.filter((t) => t.albumId === albumId).map((t) => t.trackId);
        setAlbumTracks(ids);
      });
    }
  }, [albumId]);

  return { isTrackOffline: trackOffline, offlineTrackIds: albumTracks };
}

'use client';

import { useState, useEffect } from 'react';
import { Download, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isTrackOffline, storeOfflineTrack, removeOfflineTrack } from '@/lib/offline-storage';

interface DownloadButtonProps {
  trackId: string;
  audioUrl: string;
  title: string;
  trackNumber: number;
  duration: number;
  albumId: string;
  albumTitle: string;
  albumCover: string | null;
  artistName: string;
  artistSlug: string;
  isPremium?: boolean;
}

export function DownloadButton({
  trackId,
  audioUrl,
  title,
  trackNumber,
  duration,
  albumId,
  albumTitle,
  albumCover,
  artistName,
  artistSlug,
  isPremium = false,
}: DownloadButtonProps) {
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    isTrackOffline(trackId).then(setOffline);
  }, [trackId]);

  const toggle = async () => {
    setLoading(true);
    try {
      if (offline) {
        await removeOfflineTrack(trackId);
        setOffline(false);
      } else {
        await storeOfflineTrack(trackId, audioUrl, {
          title,
          trackNumber,
          duration,
          albumId,
          albumTitle,
          albumCover,
          artistName,
          artistSlug,
        });
        setOffline(true);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (!isPremium) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={offline ? 'text-success' : 'text-text-muted'}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : offline ? (
        <Check className="h-4 w-4" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
}

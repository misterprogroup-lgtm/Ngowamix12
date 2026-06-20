'use client';

import { useState, useEffect } from 'react';
import { TrackRow } from './track-row';
import type { Track } from '@/types';

interface TrackListProps {
  tracks: Track[];
}

export function TrackList({ tracks }: TrackListProps) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const ids = tracks.map((t) => t.id).join(',');
    if (!ids) return;
    fetch(`/api/user/favorites/check?ids=${ids}`)
      .then((res) => res.json())
      .then((data) => setFavoriteIds(new Set(data.favoriteIds)))
      .catch(() => {});
  }, [tracks]);

  const handleToggleFavorite = (trackId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  };

  return (
    <div className="space-y-1">
      {tracks.map((track: Track, index: number) => (
        <TrackRow
          key={track.id}
          track={track}
          index={index}
          isPlaying={false}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
        />
      ))}
    </div>
  );
}

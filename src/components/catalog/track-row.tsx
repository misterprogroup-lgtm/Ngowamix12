'use client';

import { Play, Pause, Heart, Sparkles } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { formatDuration, cn } from '@/lib/utils';
import type { Track } from '@/types';
import { useState, useEffect } from 'react';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function isNewTrack(track: Track): boolean {
  if (!track.createdAt) return false;
  return Date.now() - new Date(track.createdAt).getTime() < SEVEN_DAYS_MS;
}

interface TrackRowProps {
  track: Track;
  index: number;
  isPlaying: boolean;
  className?: string;
  favoriteIds?: Set<string>;
  onToggleFavorite?: (trackId: string) => void;
}

export function TrackRow({
  track,
  index,
  isPlaying: _isPlaying,
  className,
  favoriteIds,
  onToggleFavorite,
}: TrackRowProps) {
  const { play, pause, currentTrack, isPlaying: storeIsPlaying } = usePlayerStore();
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (favoriteIds) {
      setIsFavorited(favoriteIds.has(track.id));
    }
  }, [favoriteIds, track.id]);

  const isPlaying = currentTrack?.id === track.id && storeIsPlaying;

  const handlePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play(track);
    }
  };

  const handleFavorite = () => {
    const newState = !isFavorited;
    setIsFavorited(newState);
    onToggleFavorite?.(track.id);
    fetch('/api/user/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackId: track.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.action === 'added' && !newState) setIsFavorited(true);
        if (data.action === 'removed' && newState) setIsFavorited(false);
      })
      .catch(() => setIsFavorited(!newState));
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-4 rounded-lg px-3 py-2 hover:bg-surface-hover transition-colors',
        isPlaying && 'bg-primary/10',
        className
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center text-text-muted">
        <span className={cn('text-sm', isPlaying && 'text-primary', 'group-hover:hidden')}>
          {index + 1}
        </span>
        <button
          onClick={handlePlay}
          className="hidden group-hover:flex items-center justify-center text-text-primary"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" fill="currentColor" />
          ) : (
            <Play className="h-4 w-4" fill="currentColor" />
          )}
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              'text-sm font-medium truncate',
              isPlaying ? 'text-primary' : 'text-text-primary'
            )}
          >
            {track.title}
          </p>
          {isNewTrack(track) && (
            <span className="shrink-0 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Sparkles className="h-2.5 w-2.5" />
              Nouveau
            </span>
          )}
          {track.isExplicit && (
            <span className="shrink-0 text-xs text-text-muted border border-border px-1.5 rounded">
              E
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
          <button
              onClick={handleFavorite}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"
            >
              <Heart className={cn('h-4 w-4', isFavorited && 'fill-primary text-primary')} />
            </button>
            <span className="text-xs text-text-muted w-10 text-right">
              {formatDuration(track.duration)}
            </span>
            <span className="text-[10px] text-text-muted hidden sm:block">
              {track.playCount > 0 ? `${track.playCount.toLocaleString('fr-FR')} écoutes` : ''}
            </span>
      </div>
    </div>
  );
}

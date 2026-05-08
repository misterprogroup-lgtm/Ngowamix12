'use client';

import { Play, Pause, Heart } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { formatDuration, cn } from '@/lib/utils';
import type { Track } from '@/types';

interface TrackRowProps {
  track: Track;
  index: number;
  isPlaying: boolean;
  className?: string;
}

export function TrackRow({
  track,
  index,
  isPlaying: _isPlaying,
  className,
}: TrackRowProps) {
  const { play, pause, currentTrack, isPlaying: storeIsPlaying } = usePlayerStore();

  const isPlaying = currentTrack?.id === track.id && storeIsPlaying;

  const handlePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play(track);
    }
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
        <p
          className={cn(
            'text-sm font-medium truncate',
            isPlaying ? 'text-primary' : 'text-text-primary'
          )}
        >
          {track.title}
        </p>
        {track.isExplicit && (
          <span className="text-xs text-text-muted border border-border px-1.5 rounded">
            E
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-primary">
          <Heart className="h-4 w-4" />
        </button>
        <span className="text-sm text-text-muted w-10 text-right">
          {formatDuration(track.duration)}
        </span>
      </div>
    </div>
  );
}

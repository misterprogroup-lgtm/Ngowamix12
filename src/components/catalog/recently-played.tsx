'use client';

import { useState, useEffect } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import Link from 'next/link';
import { Play, Pause, Music, ArrowRight } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { formatDuration } from '@/lib/utils';
import type { Track } from '@/types';

export function RecentlyPlayed() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentTrack, isPlaying, play, pause } = usePlayerStore();

  useEffect(() => {
    fetch('/api/user/recently-played')
      .then((res) => res.json())
      .then((data) => {
          setTracks(data.tracks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (tracks.length === 0) return null;

  const isTrackPlaying = (trackId: string) =>
    currentTrack?.id === trackId && isPlaying;

  const handlePlay = (track: Track) => {
    if (isTrackPlaying(track.id)) {
      pause();
    } else {
      play(track, tracks, tracks.indexOf(track));
    }
  };

  return (
    <section className="bg-surface/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Récemment écoutés</h2>
          <Link href="/user/library" className="text-sm font-medium text-primary hover:text-primary-hover hidden md:flex items-center gap-1 shrink-0">
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div
          className="flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible pb-2 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 md:space-y-1 md:gap-0 snap-scroll-container"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overscrollBehaviorX: 'contain', touchAction: 'pan-x pinch-zoom', WebkitOverflowScrolling: 'touch' }}
        >
          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => handlePlay(track)}
              className="flex items-center gap-3 w-[280px] md:w-full px-3 py-2.5 rounded-lg bg-surface md:bg-transparent hover:bg-surface-hover transition-colors group text-left shrink-0 snap-start"
            >
              <div className="relative h-10 w-10 rounded-md bg-surface-hover overflow-hidden shrink-0">
              {track.album?.coverImage ? (
                <SafeImage src={track.album.coverImage} alt="" fill className="object-cover" sizes="40px" fallback={<Music className="h-5 w-5 text-text-muted" />} />
              ) : (
                <Music className="h-5 w-5 text-text-muted" />
              )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary truncate group-hover:text-primary transition-colors">
                  {track.title}
                </p>
                <p className="text-xs text-text-secondary truncate">
                  {track.album?.artist?.name}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {isTrackPlaying(track.id) ? (
                  <Pause className="h-4 w-4 text-primary" fill="currentColor" />
                ) : (
                  <Play className="h-4 w-4 text-primary ml-0.5" fill="currentColor" />
                )}
              </div>
              <span className="text-xs text-text-muted shrink-0">{formatDuration(track.duration)}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

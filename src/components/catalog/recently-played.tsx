'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Music } from 'lucide-react';
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
    <section className="py-12 bg-surface/50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Récemment écoutés</h2>
        <div className="space-y-1">
          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => handlePlay(track)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-surface-hover transition-colors group text-left"
            >
              <div className="h-10 w-10 rounded-md bg-surface-hover overflow-hidden shrink-0 flex items-center justify-center">
                {track.album?.coverImage ? (
                  <img src={track.album.coverImage} alt="" className="h-full w-full object-cover" />
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

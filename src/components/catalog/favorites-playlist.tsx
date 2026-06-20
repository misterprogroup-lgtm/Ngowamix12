'use client';

import { useState, useEffect } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import { Play, Pause, Music, Heart, Plus } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { formatDuration } from '@/lib/utils';
import type { Track } from '@/types';
import { AddToPlaylistModal } from '@/components/catalog/add-to-playlist-modal';

export function FavoritesPlaylist() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [playlistPickerTrack, setPlaylistPickerTrack] = useState<string | null>(null);
  const { currentTrack, isPlaying, play, pause } = usePlayerStore();

  useEffect(() => {
    fetch('/api/user/favorites')
      .then((res) => res.json())
      .then((data) => {
        const favTracks = (data.tracks || []).map((f: { track: Track }) => f.track).filter(Boolean);
        setTracks(favTracks);
        setFavoriteIds(new Set(favTracks.map((t: Track) => t.id)));
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

  const handleToggleFavorite = (trackId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  };

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
          <Heart className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Favoris</h2>
          <p className="text-sm text-text-secondary">{tracks.length} titre{tracks.length > 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="space-y-1">
        {tracks.map((track) => (
          <button
            key={track.id}
            onClick={() => handlePlay(track)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-surface-hover transition-colors group text-left"
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(track.id);
                fetch('/api/user/favorites', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ trackId: track.id }),
                });
              }}
              className="p-1.5 hover:scale-110 transition-transform"
            >
              <Heart
                className={cn(
                  'h-4 w-4',
                  favoriteIds.has(track.id) ? 'fill-red-500 text-red-500' : 'text-text-muted'
                )}
              />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setPlaylistPickerTrack(track.id); }}
              className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary text-text-muted shrink-0"
            >
              <Plus className="h-4 w-4" />
            </button>
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
      <AddToPlaylistModal
        isOpen={!!playlistPickerTrack}
        onClose={() => setPlaylistPickerTrack(null)}
        trackId={playlistPickerTrack ?? ''}
      />
    </section>
  );
}

function cn(...inputs: unknown[]) {
  return inputs.filter(Boolean).join(' ');
}

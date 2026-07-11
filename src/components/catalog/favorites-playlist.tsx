'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { MusicList, type MusicListItem } from '@/components/track/music-list';
import { usePlayerStore } from '@/store/player-store';
import type { Track } from '@/types';
import { AddToPlaylistModal } from '@/components/catalog/add-to-playlist-modal';

export function FavoritesPlaylist() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [playlistPickerTrack, setPlaylistPickerTrack] = useState<string | null>(null);
  const { currentTrack, isPlaying, play, pause } = usePlayerStore();

  useEffect(() => {
    fetch('/api/user/favorites')
      .then((res) => res.json())
      .then((data) => {
        const favTracks = (data.tracks || []).map((f: { track: Track }) => f.track).filter(Boolean);
        setTracks(favTracks);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (tracks.length === 0) return null;

  const items: MusicListItem[] = tracks.map((t) => ({
    id: t.id,
    title: t.title,
    artist: t.album?.artist?.name ?? '',
    cover: t.album?.coverImage ?? null,
    duration: t.duration,
    isLiked: true,
  }));

  const handlePlay = (id: string) => {
    if (currentTrack?.id === id && isPlaying) {
      pause();
    } else {
      const track = tracks.find((t) => t.id === id);
      if (track) {
        const index = tracks.indexOf(track);
        play(track, tracks, index);
      }
    }
  };

  const handleMenu = (id: string) => {
    setPlaylistPickerTrack(id);
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
      <MusicList
        items={items}
        isPlaying={isPlaying}
        currentId={currentTrack?.id}
        onPlay={handlePlay}
        onMenu={handleMenu}
      />
      <AddToPlaylistModal
        isOpen={!!playlistPickerTrack}
        onClose={() => setPlaylistPickerTrack(null)}
        trackId={playlistPickerTrack ?? ''}
      />
    </section>
  );
}

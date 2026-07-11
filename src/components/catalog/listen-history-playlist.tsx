'use client';

import { useState, useEffect } from 'react';
import { Headphones, Plus } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { MusicList } from '@/components/track/music-list';
import type { Track } from '@/types';
import { AddToPlaylistModal } from '@/components/catalog/add-to-playlist-modal';

export function ListenHistoryPlaylist() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [playlistPickerTrack, setPlaylistPickerTrack] = useState<string | null>(null);
  const { currentTrack, isPlaying, play, pause } = usePlayerStore();

  useEffect(() => {
    fetch('/api/user/listen-history')
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
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Headphones className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Ma playlist</h2>
          <p className="text-sm text-text-secondary">{tracks.length} titre{tracks.length > 1 ? 's' : ''}</p>
        </div>
      </div>
      <MusicList
        items={tracks.map((track) => ({
          id: track.id,
          title: track.title,
          artist: track.album?.artist?.name || 'Artiste inconnu',
          cover: track.album?.coverImage || null,
          duration: track.duration,
          artistSlug: track.album?.artist?.slug,
        }))}
        currentId={currentTrack?.id}
        isPlaying={isPlaying}
        onPlay={(trackId) => {
          const track = tracks.find((t) => t.id === trackId);
          if (track) handlePlay(track);
        }}
        onMenu={(trackId) => setPlaylistPickerTrack(trackId)}
      />
      <AddToPlaylistModal
        isOpen={!!playlistPickerTrack}
        onClose={() => setPlaylistPickerTrack(null)}
        trackId={playlistPickerTrack ?? ''}
      />
    </section>
  );
}

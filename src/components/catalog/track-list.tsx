'use client';

import { MusicList, type MusicListItem } from '@/components/track/music-list';
import { usePlayerStore } from '@/store/player-store';
import type { Track } from '@/types';

interface TrackListProps {
  tracks: Track[];
}

export function TrackList({ tracks }: TrackListProps) {
  const { currentTrack, isPlaying, play, pause } = usePlayerStore();

  const items: MusicListItem[] = tracks.map((t) => ({
    id: t.id,
    title: t.title,
    artist: t.album.artist.name,
    cover: t.album.coverImage,
    duration: t.duration,
    artistSlug: t.album.artist.slug,
  }));

  const handlePlay = (id: string) => {
    if (currentTrack?.id === id && isPlaying) {
      pause();
    } else {
      const track = tracks.find((t) => t.id === id);
      if (track) {
        const index = tracks.findIndex((t) => t.id === id);
        play(track, tracks, index);
      }
    }
  };

  return (
    <MusicList
      items={items}
      isPlaying={isPlaying}
      currentId={currentTrack?.id}
      onPlay={handlePlay}
    />
  );
}

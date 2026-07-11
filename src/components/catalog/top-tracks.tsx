'use client';

import { MusicList, type MusicListItem } from '@/components/track/music-list';
import { usePlayerStore } from '@/store/player-store';
import { formatNumber } from '@/lib/utils';
import { Headphones } from 'lucide-react';
import type { Track } from '@/types';

interface TopTrackData {
  id: string;
  title: string;
  duration: number;
  playCount: number;
  audioFile: string;
  album: {
    title: string;
    slug: string;
    coverImage: string | null;
    artist: { name: string; slug: string };
  };
}

export function TopTracks({ tracks }: { tracks: TopTrackData[] }) {
  const { play, togglePlay, currentTrack, isPlaying } = usePlayerStore();

  const toTrack = (t: TopTrackData): Track => ({
    id: t.id,
    title: t.title,
    slug: '',
    trackNumber: 0,
    duration: t.duration,
    audioFile: t.audioFile,
    isExplicit: false,
    isPremiumOnly: false,
    playCount: t.playCount,
    album: {
      id: '',
      title: t.album.title,
      coverImage: t.album.coverImage,
      artist: {
        id: '',
        name: t.album.artist.name,
        slug: t.album.artist.slug,
        avatar: null,
      },
    },
  });

  const items: MusicListItem[] = tracks.map((t) => ({
    id: t.id,
    title: t.title,
    artist: t.album.artist.name,
    cover: t.album.coverImage,
    duration: t.duration,
  }));

  const handlePlay = (id: string) => {
    if (currentTrack?.id === id && isPlaying) {
      togglePlay();
    } else {
      const track = tracks.find((t) => t.id === id);
      if (track) {
        const allTracks = tracks.map(toTrack);
        const index = tracks.findIndex((t) => t.id === id);
        play(toTrack(track), allTracks, index);
      }
    }
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <MusicList
        items={items}
        isPlaying={isPlaying}
        currentId={currentTrack?.id}
        onPlay={handlePlay}
      />
    </div>
  );
}

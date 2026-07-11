'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MusicList, type MusicListItem } from '@/components/track/music-list';
import { usePlayerStore } from '@/store/player-store';
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

  const items: MusicListItem[] = tracks.map((t) => ({
    id: t.id,
    title: t.title,
    artist: t.album?.artist?.name ?? '',
    cover: t.album?.coverImage ?? null,
    duration: t.duration,
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

  return (
    <section className="bg-surface/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Récemment écoutés</h2>
          <Link href="/user/library" className="text-sm font-medium text-primary hover:text-primary-hover hidden md:flex items-center gap-1 shrink-0">
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <MusicList
          items={items}
          isPlaying={isPlaying}
          currentId={currentTrack?.id}
          onPlay={handlePlay}
        />
      </div>
    </section>
  );
}

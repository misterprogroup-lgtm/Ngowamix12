'use client';

import { useState, useEffect } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import Link from 'next/link';
import { Music, ArrowRight } from 'lucide-react';
import { GENRES } from '@/lib/constants';
import { MusicList, type MusicListItem } from '@/components/track/music-list';
import { usePlayerStore } from '@/store/player-store';
import type { Track } from '@/types';

interface GenreExploreProps {
  onGenreSelect?: (genre: string) => void;
}

export function GenreExplore({ onGenreSelect }: GenreExploreProps) {
  const [selected, setSelected] = useState('Tout');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [cover, setCover] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { play, togglePlay, currentTrack, isPlaying } = usePlayerStore();

  useEffect(() => {
    setLoading(true);
    setTracks([]);
    setCover(null);

    const url = selected === 'Tout'
      ? '/api/tracks?limit=6'
      : `/api/tracks?limit=6&genre=${encodeURIComponent(selected)}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const items = (data.tracks || []).slice(0, 6);
        setTracks(items);
        if (items.length > 0 && items[0].album?.coverImage) {
          setCover(items[0].album.coverImage);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selected]);

  const genreList = GENRES.slice(0, 8);

  const items: MusicListItem[] = tracks.map((t) => ({
    id: t.id,
    title: t.title,
    artist: t.album?.artist?.name ?? '',
    cover: t.album?.coverImage ?? null,
    duration: t.duration,
  }));

  const handlePlay = (id: string) => {
    if (currentTrack?.id === id && isPlaying) {
      togglePlay();
    } else {
      const track = tracks.find((t) => t.id === id);
      if (track) {
        const index = tracks.indexOf(track);
        play(track, tracks, index);
      }
    }
  };

  return (
    <section className="bg-surface/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Explorer</h2>
          <Link href="/explore" className="text-sm font-medium text-primary hover:text-primary-hover hidden md:flex items-center gap-1 shrink-0">
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="text-text-secondary text-sm mb-6">Découvrez la musique par genre</p>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide snap-x snap-mandatory snap-scroll-container -mx-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {['Tout', ...genreList].map((genre) => (
            <button
              key={genre}
              onClick={() => {
                setSelected(genre);
                onGenreSelect?.(genre);
              }}
              className={`snap-start shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selected === genre
                  ? 'bg-primary text-white'
                  : 'bg-surface-hover/50 hover:bg-surface-hover text-text-secondary'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="animate-pulse grid md:grid-cols-[1fr_1fr] gap-6">
            <div className="aspect-square rounded-2xl bg-surface-hover" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 bg-surface-hover rounded-lg" />
              ))}
            </div>
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <Music className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Aucun titre pour ce genre</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_1fr] gap-6 items-start">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-hover">
              {cover ? (
                <SafeImage src={cover} alt={selected} fill sizes="50vw" className="object-cover" fallback={<div className="flex h-full items-center justify-center text-text-muted"><Music className="h-16 w-16" /></div>} />
              ) : (
                <div className="flex h-full items-center justify-center text-text-muted">
                  <Music className="h-16 w-16" />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-lg font-bold text-white">{selected}</p>
                <p className="text-sm text-white/70">{tracks.length} titres</p>
              </div>
            </div>

            <MusicList
              items={items}
              isPlaying={isPlaying}
              currentId={currentTrack?.id}
              onPlay={handlePlay}
            />
          </div>
        )}
      </div>
    </section>
  );
}

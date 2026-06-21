'use client';

import { useState, useEffect } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import Link from 'next/link';
import { Music, Play, Pause, ArrowRight } from 'lucide-react';
import { GENRES } from '@/lib/constants';
import { formatDuration } from '@/lib/utils';
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

  return (
    <section className="bg-surface/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Explore</h2>
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

            <div className="space-y-2">
              {tracks.map((track, index) => {
                const isCurrentTrack = currentTrack?.id === track.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      if (isCurrentTrack && isPlaying) {
                        togglePlay();
                      } else {
                        play(track, tracks, index);
                      }
                    }}
                    className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-hover transition-colors group w-full text-left"
                  >
                    <span className="text-sm text-text-muted w-6 text-right shrink-0">
                      {isCurrentTrack && isPlaying ? (
                        <Pause className="h-4 w-4 text-primary mx-auto" fill="currentColor" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <div className="relative h-10 w-10 shrink-0 rounded-md overflow-hidden bg-surface">
                      {track.album?.coverImage ? (
                        <SafeImage src={track.album.coverImage} alt="" fill sizes="40px" className="object-cover" fallback={<div className="flex h-full items-center justify-center text-text-muted"><Music className="h-4 w-4" /></div>} />
                      ) : (
                        <div className="flex h-full items-center justify-center text-text-muted">
                          <Music className="h-4 w-4" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-4 w-4 text-white" fill="currentColor" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isCurrentTrack ? 'text-primary' : 'text-text-primary'}`}>{track.title}</p>
                      <p className="text-xs text-text-secondary truncate">{track.album.artist.name}</p>
                    </div>
                    <span className="text-xs text-text-muted shrink-0">{formatDuration(track.duration)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import Link from 'next/link';
import { Play, Pause, Music, Clock, TrendingUp, Headphones, ArrowRight } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { formatDuration, formatNumber } from '@/lib/utils';
import type { Track } from '@/types';

interface ChartTrack {
  id: string;
  title: string;
  duration: number;
  playCount: number;
  audioFile: string;
  album: {
    title: string;
    coverImage: string | null;
    artist: { name: string; slug: string };
  };
}

interface TopAlbum {
  id: string;
  title: string;
  coverImage: string | null;
  playCount: number;
  artist: { name: string };
}

export function TopCharts({ tracks: initialTracks, topAlbum: initialTopAlbum }: { tracks: ChartTrack[]; topAlbum: TopAlbum | null }) {
  const [tracks, setTracks] = useState<ChartTrack[]>(initialTracks);
  const [topAlbum, setTopAlbum] = useState<TopAlbum | null>(initialTopAlbum);
  const { play, togglePlay, currentTrack, isPlaying } = usePlayerStore();

  const handlePlay = (track: ChartTrack) => {
    const trackData: Track = {
      id: track.id,
      title: track.title,
      slug: '',
      trackNumber: 0,
      duration: track.duration,
      audioFile: track.audioFile,
      isExplicit: false,
      isPremiumOnly: false,
      playCount: track.playCount,
      album: {
        id: '',
        title: track.album.title,
        coverImage: track.album.coverImage,
        artist: {
          id: '',
          name: track.album.artist.name,
          slug: track.album.artist.slug,
          avatar: null,
        },
      },
    };

    if (currentTrack?.id === track.id && isPlaying) {
      togglePlay();
    } else {
      play(
        trackData,
        tracks.map((t) => ({
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
        })),
        tracks.findIndex((t) => t.id === track.id)
      );
    }
  };

  if (tracks.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#ff9900]" />
          <h2 className="text-lg md:text-xl font-black text-white tracking-tight">Top 10</h2>
        </div>
        <Link
          href="/explore?sort=plays"
          className="flex items-center gap-1 text-sm font-medium text-[#888] hover:text-[#ff9900] transition-colors"
        >
          VOIR TOUT <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid md:grid-cols-5 gap-6 items-start">
        {topAlbum && (
          <div className="hidden md:block md:col-span-2">
            <Link href={`/album/${topAlbum.id}`} className="group block">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#ff990022] to-[#ff990008] p-6 ring-1 ring-[#ff990033]">
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative aspect-square w-full max-w-[240px] rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/10 mb-5">
                    <SafeImage
                      src={topAlbum.coverImage || ''}
                      alt={topAlbum.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="240px"
                      fallback={<div className="flex h-full items-center justify-center"><Music className="h-16 w-16 text-[#555]" /></div>}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="h-14 w-14 rounded-full bg-[#ff9900] text-white shadow-lg shadow-[#ff9900]/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                        <Play className="h-6 w-6 ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 bg-[#ff9900] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 z-20 shadow-lg">
                    <TrendingUp className="h-3 w-3" />
                    #1 du mois
                  </div>
                  <p className="font-bold text-white text-lg text-center truncate max-w-full">{topAlbum.title}</p>
                  <p className="text-sm text-[#888] text-center truncate max-w-full">{topAlbum.artist.name}</p>
                  <p className="text-xs text-[#666] flex items-center gap-1 mt-2">
                    <Headphones className="h-3 w-3" />
                    {formatNumber(topAlbum.playCount)} écoutes
                  </p>
                </div>
              </div>
            </Link>
          </div>
        )}

        <div className={topAlbum ? 'md:col-span-3' : 'md:col-span-5'}>
          <div className="rounded-xl border border-[#ffffff08] overflow-hidden bg-[#0b0b0b]">
            {tracks.slice(0, 10).map((track, index) => {
              const isCurrentTrack = currentTrack?.id === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => handlePlay(track)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#ffffff08] transition-colors border-b border-[#ffffff08] last:border-0 w-full text-left group"
                >
                  <span className="relative w-6 text-center shrink-0">
                    {isCurrentTrack && isPlaying ? (
                      <Pause className="h-4 w-4 text-[#ff9900] mx-auto" fill="currentColor" />
                    ) : isCurrentTrack ? (
                      <Play className="h-4 w-4 text-[#ff9900] mx-auto" fill="currentColor" />
                    ) : (
                      <span className="text-sm text-[#555] font-bold group-hover:hidden">{index + 1}</span>
                    )}
                    <span className="hidden group-hover:inline text-[#ff9900]">
                      <Play className="h-4 w-4 mx-auto" fill="currentColor" />
                    </span>
                  </span>
                  <div className="relative h-10 w-10 rounded-md bg-[#141414] overflow-hidden shrink-0">
                    {track.album.coverImage ? (
                      <SafeImage src={track.album.coverImage} alt="" fill sizes="40px" className="object-cover" fallback={<div className="flex h-full items-center justify-center"><Music className="h-4 w-4 text-[#555]" /></div>} />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Music className="h-4 w-4 text-[#555]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold truncate ${isCurrentTrack ? 'text-[#ff9900]' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-[#777] truncate">{track.album.artist.name}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#555] shrink-0">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(track.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {formatNumber(track.playCount)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { Play, Music } from 'lucide-react';
import { HorizontalScroll } from '@/components/ui/horizontal-scroll';

interface TrendingSong {
  id: string;
  title: string;
  artist: string;
  artistImage?: string | null;
  cover: string | null;
  plays?: number;
}

export function TrendingSongs({ tracks }: { tracks: TrendingSong[] }) {
  if (!tracks.length) return null;

  return (
    <HorizontalScroll
      title="Titres tendances"
      seeAllHref="/explore"
      withPadding={false}
    >
      {tracks.map((song) => (
        <Link
          key={song.id}
          href={`/track/${song.id}`}
          className="group block w-2/5 sm:w-1/4 shrink-0 snap-start px-1.5">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-[#141414] border border-[#ffffff08] transition-all duration-200 group-hover:border-[#ff990033]">
            <SafeImage
              src={song.cover || ''}
              alt={song.title}
              fill
              sizes="185px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              fallback={
                <div className="flex h-full items-center justify-center text-[#555]">
                  <Music className="h-10 w-10" />
                </div>
              }
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-[#ff9900] text-white shadow-lg shadow-[#ff9900]/30 flex items-center justify-center translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
              </div>
            </div>
          </div>
            <div className="mt-2.5 px-0.5 space-y-0.5">
              <p className="text-sm font-semibold text-white truncate group-hover:text-[#ff9900] transition-colors duration-200">
                {song.title}
              </p>
              <p className="text-xs text-[#777] truncate">{song.artist}</p>
            </div>
        </Link>
      ))}
    </HorizontalScroll>
  );
}

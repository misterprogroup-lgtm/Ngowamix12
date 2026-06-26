'use client';

import { useState } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import Link from 'next/link';
import { Play, Music, BadgeCheck, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/store/player-store';
import type { Track } from '@/types';

interface ArtistCardProps {
  id: string;
  name: string;
  slug: string;
  avatar: string | null;
  isVerified?: boolean;
  showPlayButton?: boolean;
  className?: string;
}

export function ArtistCard({
  id,
  name,
  slug,
  avatar,
  isVerified = false,
  showPlayButton = false,
  className,
}: ArtistCardProps) {
  const [loading, setLoading] = useState(false);
  const { play, currentTrack, isPlaying } = usePlayerStore();

  const isArtistPlaying = currentTrack?.album?.artist?.id === id && isPlaying;

  const handlePlay = async () => {
    if (isArtistPlaying) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tracks?artistId=${encodeURIComponent(id)}&limit=20`);
      const data = await res.json();
      const tracks: Track[] = data.tracks || [];
      if (tracks.length > 0) {
        play(tracks[0], tracks, 0);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col items-center text-center group cursor-pointer', className)}>
      <Link
        href={`/artist/${slug}`}
        className="flex flex-col items-center gap-3 text-center transition-transform hover:scale-105"
      >
        <div className="relative mb-1">
          <div className="h-28 w-28 rounded-full bg-surface border-2 border-border overflow-hidden transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/10">
            {avatar ? (
              <SafeImage
                src={avatar}
                alt={name}
                width={112}
                height={112}
                className="object-cover w-full h-full transition-transform group-hover:scale-110"
                fallback={
                  <div className="flex h-full items-center justify-center text-text-muted">
                    <User className="h-8 w-8" />
                  </div>
                }
              />
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted">
                <User className="h-8 w-8" />
              </div>
            )}
          </div>
          {isVerified && (
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center ring-2 ring-background">
              <BadgeCheck className="h-3.5 w-3.5 text-white" />
            </div>
          )}
        </div>
        <div>
          <p className="font-semibold text-text-primary group-hover:text-primary transition-colors">
            {name}
          </p>
          <p className="text-xs text-text-muted">Artiste</p>
        </div>
      </Link>
      {showPlayButton && (
        <button
          onClick={handlePlay}
          disabled={loading}
          className="mt-2 px-5 py-1.5 rounded-full border border-primary bg-transparent text-text-primary text-xs font-semibold transition-all duration-300 hover:bg-primary hover:text-white disabled:opacity-50"
        >
          {loading ? (
            <span className="h-3 w-3 inline-block animate-spin rounded-full border-2 border-text-muted border-t-transparent" />
          ) : isArtistPlaying ? (
            'En cours'
          ) : (
            'Écouter'
          )}
        </button>
      )}
    </div>
  );
}

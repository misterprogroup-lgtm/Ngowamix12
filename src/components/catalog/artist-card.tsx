'use client';

import { useState } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import Link from 'next/link';
import { Play, Pause, Music, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
    if (isArtistPlaying) {
      return;
    }
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
    <div className={cn('flex flex-col items-center text-center', className)}>
      <Link
        href={`/artist/${slug}`}
        className="group flex flex-col items-center gap-3 text-center transition-transform hover:scale-105"
      >
        <div className="relative h-32 w-32 rounded-full bg-surface-hover">
          <div className="relative h-full w-full overflow-hidden rounded-full">
            {avatar ? (
              <SafeImage
                src={avatar}
                alt={name}
                fill
                className="object-cover transition-transform group-hover:scale-110"
                sizes="128px"
                fallback={<div className="flex h-full items-center justify-center text-text-muted"><Music className="h-10 w-10" /></div>}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted">
                <Music className="h-10 w-10" />
              </div>
            )}
          </div>
          {isVerified && (
            <BadgeCheck className="absolute -bottom-1 -right-1 h-7 w-7 text-primary bg-background rounded-full" />
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
        <div className="mt-2">
          <Button variant="outline" size="sm" onClick={handlePlay} disabled={loading}>
            {loading ? (
              <span className="h-3.5 w-3.5 mr-1 animate-spin rounded-full border-2 border-text-muted border-t-transparent" />
            ) : isArtistPlaying ? (
              <Pause className="h-3.5 w-3.5 mr-1" fill="currentColor" />
            ) : (
              <Play className="h-3.5 w-3.5 mr-1" fill="currentColor" />
            )}
            {loading ? 'Chargement...' : isArtistPlaying ? 'En cours' : 'Écouter'}
          </Button>
        </div>
      )}
    </div>
  );
}

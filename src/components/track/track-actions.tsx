'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Heart, Crown, Download } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { Track } from '@/types';

interface TrackActionsProps {
  track: Track;
  albumTracks: Track[];
}

export function TrackActions({ track, albumTracks }: TrackActionsProps) {
  const { play, pause, currentTrack, isPlaying } = usePlayerStore();
  const { user } = useAuthStore();
  const [isLiked, setIsLiked] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);

  const isPremium = user?.isPremium ?? false;
  const isThisPlaying = currentTrack?.id === track.id && isPlaying;

  useEffect(() => {
    fetch(`/api/user/favorites/check?ids=${track.id}`)
      .then((r) => r.json())
      .then((data) => setIsLiked(data.favoriteIds?.includes(track.id) ?? false))
      .catch(() => {});
  }, [track.id]);

  const togglePlay = () => {
    if (track.isPremiumOnly && !isPremium) return;
    if (isThisPlaying) {
      pause();
    } else {
      play(track, albumTracks, albumTracks.findIndex((t) => t.id === track.id));
    }
  };

  const toggleLike = async () => {
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 300);
    const prev = isLiked;
    setIsLiked(!prev);
    try {
      const res = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: track.id }),
      });
      const data = await res.json();
      setIsLiked(data.action === 'added');
    } catch {
      setIsLiked(prev);
    }
  };

  if (track.isPremiumOnly && !isPremium) {
    return (
      <Link
        href="/premium"
        className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-linear-to-r from-primary to-accent text-white font-semibold hover:opacity-90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary/30"
      >
        <Crown className="h-5 w-5" />
        Débloquer avec Premium
      </Link>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <button
        onClick={togglePlay}
        className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
      >
        {isThisPlaying ? (
          <Pause className="h-5 w-5" fill="currentColor" />
        ) : (
          <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
        )}
        {isThisPlaying ? 'Pause' : 'Écouter'}
      </button>

      <button
        onClick={toggleLike}
        className={cn(
          'flex items-center gap-2 px-4 py-3 rounded-full border border-border text-sm font-medium transition-all duration-200',
          likeAnim && 'animate-pop',
          isLiked
            ? 'text-primary border-primary/40 bg-primary/10'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface'
        )}
      >
        <Heart className={cn('h-4 w-4', isLiked && 'fill-primary')} />
        {isLiked ? 'Retirer' : 'J\'aime'}
      </button>

      <a
        href={track.audioFile}
        download
        className="inline-flex items-center gap-2 px-4 py-3 rounded-full border border-border text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface transition-all duration-200"
      >
        <Download className="h-4 w-4" />
        Télécharger
      </a>
    </div>
  );
}

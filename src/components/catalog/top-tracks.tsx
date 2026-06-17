'use client';

import { SafeImage } from '@/components/ui/safe-image';
import { Play, Pause, Music, Clock, Headphones } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { formatDuration, formatNumber } from '@/lib/utils';
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

  const handlePlay = (track: TopTrackData) => {
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
      play(trackData, tracks.map((t) => ({
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
      })), tracks.findIndex((t) => t.id === track.id));
    }
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {tracks.map((track, index) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        return (
          <button
            key={track.id}
            onClick={() => handlePlay(track)}
            className="flex items-center gap-4 px-4 py-3 hover:bg-surface-hover transition-colors border-b border-border last:border-0 w-full text-left"
          >
            <span className="text-sm text-text-muted w-6 text-center font-medium shrink-0">
              {isCurrentTrack && isPlaying ? (
                <Pause className="h-4 w-4 text-primary mx-auto" fill="currentColor" />
              ) : isCurrentTrack ? (
                <Play className="h-4 w-4 text-primary mx-auto" fill="currentColor" />
              ) : (
                index + 1
              )}
            </span>
            <div className="relative h-10 w-10 rounded-md bg-surface-hover overflow-hidden shrink-0">
              {track.album.coverImage ? (
                <SafeImage src={track.album.coverImage} alt="" fill className="object-cover" sizes="40px" fallback={<div className="flex h-full items-center justify-center"><Music className="h-4 w-4 text-text-muted" /></div>} />
              ) : (
                <div className="flex h-full items-center justify-center"><Music className="h-4 w-4 text-text-muted" /></div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium truncate ${isCurrentTrack ? 'text-primary' : ''}`}>
                {track.title}
              </p>
              <p className="text-xs text-text-secondary truncate">{track.album.title}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-text-muted shrink-0">
              <span className="flex items-center gap-1"><Headphones className="h-3 w-3" />{formatNumber(track.playCount)}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(track.duration)}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

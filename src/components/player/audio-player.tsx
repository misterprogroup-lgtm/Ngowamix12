'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  Music,
  AlertCircle,
} from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { formatDuration, cn } from '@/lib/utils';
import { useToast } from '@/components/feedback/toast';

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { addToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    queue,
    queueIndex,
    repeat,
    shuffle,
    setAudioElement,
    togglePlay,
    setProgress,
    setDuration,
    setVolume,
    setPlaying,
    next,
    prev,
    toggleRepeat,
    toggleShuffle,
  } = usePlayerStore();

  useEffect(() => {
    if (audioRef.current) {
      setAudioElement(audioRef.current);
    }
  }, [setAudioElement]);

  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;
    const audio = audioRef.current;
    audio.src = currentTrack.audioFile;
    audio.load();
    audio.play().catch((err) => {
      console.error('Auto-play error:', err);
      setError('Erreur de lecture');
    });
  }, [currentTrack?.id]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        next();
      }
    };
    const handleError = () => {
      setError('Erreur de lecture');
      addToast({
        type: 'error',
        title: 'Erreur de lecture',
        message: 'Impossible de jouer ce titre',
      });
    };
    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [next, repeat, setProgress, setDuration, setPlaying, addToast]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * duration;
  };

  const progressPercent = duration ? (progress / duration) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} preload="metadata" />
      {!currentTrack ? null : (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur transition-all duration-300',
      isExpanded ? 'h-64 md:h-72' : 'h-16 md:h-20',
      error && 'border-error/30'
    )}>

      <div className={cn(
        'container mx-auto px-4 h-full flex flex-col',
        isExpanded && 'py-4'
      )}>
        {/* Main bar */}
        <div className="flex items-center gap-4 flex-1 min-h-0">
          {/* Track info */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 min-w-0 flex-1 md:flex-none md:w-64"
          >
            <div className="relative h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-md overflow-hidden bg-surface-hover">
              {currentTrack.album?.coverImage ? (
                <Image
                  src={currentTrack.album.coverImage}
                  alt={currentTrack.album.title}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-text-muted">
                  <Music className="h-4 w-4 md:h-5 md:w-5" />
                </div>
              )}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-sm font-medium text-text-primary truncate">
                {currentTrack.title}
              </p>
              {currentTrack.album && (
                <Link
                  href={`/artist/${currentTrack.album.artist.slug}`}
                  className="text-xs text-text-secondary hover:text-primary transition-colors truncate block"
                  onClick={(e) => e.stopPropagation()}
                >
                  {currentTrack.album.artist.name}
                </Link>
              )}
            </div>
          </button>

          {/* Controls */}
          <div className="flex flex-col items-center gap-1 flex-1 max-w-xl mx-auto">
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={toggleShuffle}
                className={cn(
                  'hidden md:block text-text-muted hover:text-text-primary transition-colors p-1',
                  shuffle && 'text-primary'
                )}
              >
                <Shuffle className="h-4 w-4" />
              </button>
              <button
                onClick={prev}
                className="text-text-secondary hover:text-text-primary transition-colors p-1"
              >
                <SkipBack className="h-4 w-4 md:h-5 md:w-5" />
              </button>
              <button
                onClick={togglePlay}
                className={cn(
                  'flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full transition-colors',
                  error
                    ? 'bg-error/20 text-error hover:bg-error/30'
                    : 'bg-primary text-white hover:bg-primary-hover'
                )}
              >
                {error ? (
                  <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
                ) : isPlaying ? (
                  <Pause className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" />
                ) : (
                  <Play className="h-4 w-4 md:h-5 md:w-5 ml-0.5" fill="currentColor" />
                )}
              </button>
              <button
                onClick={next}
                className="text-text-secondary hover:text-text-primary transition-colors p-1"
              >
                <SkipForward className="h-4 w-4 md:h-5 md:w-5" />
              </button>
              <button
                onClick={toggleRepeat}
                className={cn(
                  'hidden md:block text-text-muted hover:text-text-primary transition-colors p-1',
                  repeat && 'text-primary'
                )}
              >
                <Repeat className="h-4 w-4" />
              </button>
            </div>

            {!isExpanded && (
              <div className="flex items-center gap-2 w-full">
                <span className="text-xs text-text-muted w-8 text-right hidden md:block">
                  {formatDuration(progress)}
                </span>
                <div
                  className="flex-1 h-1 rounded-full bg-surface-hover cursor-pointer group"
                  onClick={handleProgressClick}
                >
                  <div
                    className={cn(
                      'h-full rounded-full relative group-hover:opacity-100 transition-colors',
                      error ? 'bg-error' : 'bg-primary'
                    )}
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <span className="text-xs text-text-muted w-8 hidden md:block">
                  {formatDuration(duration)}
                </span>
              </div>
            )}
          </div>

          {/* Volume */}
          <div className="hidden md:flex items-center gap-2 w-32">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-1 accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Expanded view */}
        {isExpanded && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-text-muted w-10 text-right">
                {formatDuration(progress)}
              </span>
              <div
                className="flex-1 h-2 rounded-full bg-surface-hover cursor-pointer group"
                onClick={handleProgressClick}
              >
                <div
                  className={cn(
                    'h-full rounded-full relative',
                    error ? 'bg-error' : 'bg-primary'
                  )}
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <span className="text-xs text-text-muted w-10">
                {formatDuration(duration)}
              </span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button onClick={toggleShuffle} className={cn('text-text-muted hover:text-text-primary p-2', shuffle && 'text-primary')}>
                <Shuffle className="h-5 w-5" />
              </button>
              <button onClick={prev} className="text-text-secondary hover:text-text-primary p-2">
                <SkipBack className="h-6 w-6" />
              </button>
              <button
                onClick={togglePlay}
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-full transition-colors',
                  error ? 'bg-error/20 text-error' : 'bg-primary text-white hover:bg-primary-hover'
                )}
              >
                {error ? (
                  <AlertCircle className="h-6 w-6" />
                ) : isPlaying ? (
                  <Pause className="h-6 w-6" fill="currentColor" />
                ) : (
                  <Play className="h-6 w-6 ml-1" fill="currentColor" />
                )}
              </button>
              <button onClick={next} className="text-text-secondary hover:text-text-primary p-2">
                <SkipForward className="h-6 w-6" />
              </button>
              <button onClick={toggleRepeat} className={cn('text-text-muted hover:text-text-primary p-2', repeat && 'text-primary')}>
                <Repeat className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
      )}
    </>
  );
}

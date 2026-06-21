'use client';

import { useEffect, useRef, useState } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import Link from 'next/link';
import {
  Play, Pause, SkipBack, SkipForward, Repeat, Shuffle,
  Volume2, VolumeX, Music, AlertCircle, Megaphone, ListMusic,
  ChevronUp, ChevronDown,
} from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { useAuthStore } from '@/store/auth-store';
import { formatDuration, cn } from '@/lib/utils';

export function PlayerBar() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const {
    currentTrack, isPlaying, progress, duration, volume,
    queue, queueIndex, repeat, shuffle,
    isAdPlaying, currentAd, pendingTrack, userPremium,
    setUserPremium, setAudioElement, togglePlay, setProgress,
    setDuration, setVolume, setPlaying, next, prev,
    toggleRepeat, toggleShuffle, play,
  } = usePlayerStore();

  useEffect(() => {
    if (user) setUserPremium(user.isPremium);
  }, [user, setUserPremium]);

  useEffect(() => {
    if (audioRef.current) setAudioElement(audioRef.current);
  }, [setAudioElement]);

  useEffect(() => {
    if (!currentTrack || !audioRef.current || userPremium) return;
    if (isAdPlaying || currentAd) return;
    const audio = audioRef.current;
    if (audio.src !== currentTrack.audioFile) {
      audio.src = currentTrack.audioFile;
      audio.load();
      audio.play().catch(() => setError('Erreur de lecture'));
    }
  }, [currentTrack?.id]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (isAdPlaying && currentAd && pendingTrack) {
        setPlaying(false);
        usePlayerStore.setState({ isAdPlaying: false, currentAd: null });
        audio.src = pendingTrack.audioFile;
        audio.load();
        audio.play().catch(() => {});
        usePlayerStore.setState({ currentTrack: pendingTrack, isPlaying: true, pendingTrack: null });
        return;
      }
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else next();
    };
    const handleError = () => {
      if (isAdPlaying && pendingTrack) {
        usePlayerStore.setState({ isAdPlaying: false, currentAd: null });
        audio.src = pendingTrack.audioFile;
        audio.load();
        audio.play().catch(() => {});
        usePlayerStore.setState({ currentTrack: pendingTrack, isPlaying: true, pendingTrack: null });
        return;
      }
      setError('Erreur de lecture');
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
  }, [next, repeat, setProgress, setDuration, setPlaying, isAdPlaying, currentAd, pendingTrack]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (!currentTrack || isAdPlaying) {
      navigator.mediaSession.metadata = null;
      return;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.album?.artist?.name ?? '',
      album: currentTrack.album?.title ?? '',
      artwork: [{ src: currentTrack.album?.coverImage ?? '', sizes: '512x512', type: 'image/jpeg' }],
    });
    navigator.mediaSession.setActionHandler('play', () => togglePlay());
    navigator.mediaSession.setActionHandler('pause', () => togglePlay());
    navigator.mediaSession.setActionHandler('previoustrack', () => prev());
    navigator.mediaSession.setActionHandler('nexttrack', () => next());
  }, [currentTrack?.id, isAdPlaying]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const progressPercent = duration ? (progress / duration) * 100 : 0;

  if (!currentTrack && !isAdPlaying) return null;

  return (
    <>
      <audio ref={audioRef} preload="metadata" />
      <div
        className={cn(
          'fixed left-0 right-0 z-50 bg-background border-t border-border transition-all',
          'bottom-0',
          expanded ? 'h-full md:h-96' : 'h-[72px]'
        )}
      >
        {/* Progress bar at top */}
        <div
          className="absolute top-0 left-0 right-0 h-1 bg-surface-hover cursor-pointer group"
          onClick={handleProgressClick}
        >
          <div
            className={cn(
              'h-full relative group-hover:h-1.5 transition-all',
              error ? 'bg-error' : 'bg-primary'
            )}
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
          </div>
        </div>

        {/* Content */}
        <div className="h-full flex items-center px-4">
          {/* Track info - left */}
          <div className="flex items-center gap-3 min-w-0 w-[30%]">
            <button
              onClick={() => setExpanded(!expanded)}
              className="relative h-14 w-14 shrink-0 rounded-md overflow-hidden bg-surface-hover shadow-lg"
            >
              {isAdPlaying ? (
                <div className="flex h-full items-center justify-center bg-primary/20">
                  <Megaphone className="h-6 w-6 text-primary" />
                </div>
              ) : currentTrack?.album?.coverImage ? (
                <SafeImage
                  src={currentTrack.album.coverImage}
                  alt={currentTrack.album.title}
                  fill
                  className="object-cover"
                  sizes="56px"
                  fallback={<Music className="h-5 w-5 text-text-muted" />}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-text-muted">
                  <Music className="h-5 w-5" />
                </div>
              )}
            </button>
            <div className="min-w-0">
              {isAdPlaying && currentAd ? (
                <>
                  <p className="text-sm font-medium text-primary truncate">Publicité</p>
                  <p className="text-xs text-text-secondary truncate">{currentAd.sponsor}</p>
                </>
              ) : currentTrack ? (
                <>
                  <Link
                    href={`/album/${currentTrack.album.id}`}
                    className="text-sm font-medium text-text-primary truncate block hover:text-primary transition-colors"
                  >
                    {currentTrack.title}
                  </Link>
                  {currentTrack.album && (
                    <Link
                      href={`/artist/${currentTrack.album.artist.slug}`}
                      className="text-xs text-text-secondary hover:text-primary hover:underline transition-colors truncate block"
                    >
                      {currentTrack.album.artist.name}
                    </Link>
                  )}
                </>
              ) : null}
            </div>
          </div>

          {/* Controls - center */}
          <div className="flex flex-col items-center gap-1 flex-1 max-w-xl mx-auto">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleShuffle}
                className={cn('text-text-muted hover:text-text-primary transition-colors', shuffle && 'text-primary')}
              >
                <Shuffle className="h-4 w-4" />
              </button>
              <button
                onClick={prev}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <SkipBack className="h-5 w-5" fill="currentColor" />
              </button>
              <button
                onClick={togglePlay}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full transition-colors bg-white text-black hover:scale-105',
                  error && 'bg-error/20 text-error'
                )}
              >
                {error ? (
                  <AlertCircle className="h-5 w-5" />
                ) : isPlaying ? (
                  <Pause className="h-5 w-5" fill="currentColor" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                )}
              </button>
              <button
                onClick={next}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <SkipForward className="h-5 w-5" fill="currentColor" />
              </button>
              <button
                onClick={toggleRepeat}
                className={cn('text-text-muted hover:text-text-primary transition-colors', repeat && 'text-primary')}
              >
                <Repeat className="h-4 w-4" />
              </button>
            </div>

            {!expanded && (
              <div className="hidden md:flex items-center gap-2 w-full">
                <span className="text-[11px] text-text-muted w-8 text-right tabular-nums">
                  {formatDuration(progress)}
                </span>
                <div
                  className="flex-1 h-1 rounded-full bg-surface-hover cursor-pointer group"
                  onClick={handleProgressClick}
                >
                  <div
                    className={cn(
                      'h-full rounded-full relative',
                      error ? 'bg-error' : 'bg-white/30'
                    )}
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <span className="text-[11px] text-text-muted w-8 tabular-nums">
                  {formatDuration(duration)}
                </span>
              </div>
            )}
          </div>

          {/* Volume & Queue - right */}
          <div className="hidden md:flex items-center justify-end gap-2 w-[30%]">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-text-muted hover:text-text-primary transition-colors p-1"
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
            <button className="text-text-muted hover:text-text-primary transition-colors p-1">
              <ListMusic className="h-4 w-4" />
            </button>
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
              className="text-text-muted hover:text-text-primary transition-colors p-1"
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
              className="w-24 h-1 accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Expanded view */}
        {expanded && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 w-full max-w-xl mx-auto">
              <span className="text-xs text-text-muted w-10 text-right tabular-nums">
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
              <span className="text-xs text-text-muted w-10 tabular-nums">
                {formatDuration(duration)}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

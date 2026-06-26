'use client';

import { useEffect, useRef, useState } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
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
  WifiOff,
  Megaphone,
  BadgeCheck,
  Heart,
  ListMusic,
} from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { useAuthStore } from '@/store/auth-store';
import { formatDuration, cn } from '@/lib/utils';
import { useToast } from '@/components/feedback/toast';

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { addToast } = useToast();
  const { user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);

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
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    queue,
    queueIndex,
    repeat,
    shuffle,
    isAdPlaying,
    currentAd,
    pendingTrack,
    userPremium,
    setUserPremium,
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
    play,
  } = usePlayerStore();

  useEffect(() => {
    if (!currentTrack) { setIsLiked(false); return; }
    fetch(`/api/user/favorites/check?ids=${currentTrack.id}`)
      .then(r => r.json())
      .then(data => setIsLiked(data.favoriteIds?.includes(currentTrack.id) ?? false))
      .catch(() => setIsLiked(false));
  }, [currentTrack?.id]);

  const toggleLike = async () => {
    if (!currentTrack) return;
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 300);
    const prev = isLiked;
    setIsLiked(!prev);
    try {
      const res = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: currentTrack.id }),
      });
      const data = await res.json();
      setIsLiked(data.action === 'added');
    } catch {
      setIsLiked(prev);
    }
  };

  useEffect(() => {
    if (user) setUserPremium(user.isPremium);
  }, [user, setUserPremium]);

  useEffect(() => {
    if (audioRef.current) {
      setAudioElement(audioRef.current);
    }
  }, [setAudioElement]);

  useEffect(() => {
    if (!currentTrack || !audioRef.current || userPremium) return;
    if (isAdPlaying || currentAd) return;

    const audio = audioRef.current;
    if (audio.src !== currentTrack.audioFile) {
      audio.src = currentTrack.audioFile;
      audio.load();
      audio.play().catch((err) => {
        console.error('Auto-play error:', err);
        setError('Erreur de lecture');
      });
    }
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
      if (isAdPlaying && currentAd && pendingTrack) {
        setPlaying(false);
        usePlayerStore.setState({ isAdPlaying: false, currentAd: null });
        audio.src = pendingTrack.audioFile;
        audio.load();
        audio.play().catch(() => {});
        usePlayerStore.setState({ currentTrack: pendingTrack, isPlaying: true, pendingTrack: null });
        recordListen(pendingTrack.id);
        return;
      }
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        next();
      }
    };
    const handleError = () => {
      if (isAdPlaying && pendingTrack) {
        usePlayerStore.setState({ isAdPlaying: false, currentAd: null });
        audio.src = pendingTrack.audioFile;
        audio.load();
        audio.play().catch(() => {});
        usePlayerStore.setState({ currentTrack: pendingTrack, isPlaying: true, pendingTrack: null });
        recordListen(pendingTrack.id);
        return;
      }
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
  }, [next, repeat, setProgress, setDuration, setPlaying, addToast, isAdPlaying, currentAd, pendingTrack]);

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
      artwork: [
        {
          src: currentTrack.album?.coverImage ?? '',
          sizes: '512x512',
          type: 'image/jpeg',
        },
      ],
    });

    navigator.mediaSession.setActionHandler('play', () => togglePlay());
    navigator.mediaSession.setActionHandler('pause', () => togglePlay());
    navigator.mediaSession.setActionHandler('previoustrack', () => prev());
    navigator.mediaSession.setActionHandler('nexttrack', () => next());
    navigator.mediaSession.setActionHandler('seekforward', () => {
      if (audioRef.current) audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, audioRef.current.duration);
    });
    navigator.mediaSession.setActionHandler('seekbackward', () => {
      if (audioRef.current) audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    });
  }, [currentTrack?.id, isAdPlaying]);

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
      {(currentTrack || isAdPlaying) && (
        <div className={cn(
            'fixed left-0 right-0 z-40 border-t border-border bg-background transition-all duration-300',
            'bottom-16 md:bottom-0',
            isExpanded ? 'h-64 md:h-72' : 'h-16 md:h-20',
            error && 'border-error/30',
            isAdPlaying && 'border-primary/30'
          )}>
      <div className={cn(
        'container mx-auto px-4 h-full flex flex-col',
        isExpanded && 'py-4'
      )}>
        {/* Ad banner */}
        {isAdPlaying && currentAd && (
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-t-lg -mx-4 -mt-4 mb-2">
            <Megaphone className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-xs text-primary font-medium">{currentAd.sponsor}</span>
            <span className="text-xs text-text-muted">— {currentAd.text}</span>
          </div>
        )}

        {/* Main bar */}
        <div className="flex items-center gap-4 flex-1 min-h-0">
          {/* Track info */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 min-w-0 flex-1 md:flex-none md:w-72"
          >
            <div className="relative h-10 w-10 md:h-14 md:w-14 shrink-0 rounded-full overflow-hidden bg-surface-hover shadow-md shadow-black/10 ring-2 ring-border">
              {isAdPlaying ? (
                <div className="flex h-full items-center justify-center bg-primary/20">
                  <Megaphone className="h-5 w-5 text-primary" />
                </div>
              ) : currentTrack?.album?.coverImage ? (
                <SafeImage
                  src={currentTrack.album.coverImage}
                  alt={currentTrack.album.title}
                  fill
                  className={cn(
                    'object-cover transition-transform duration-300',
                    isPlaying ? 'animate-spin-slow' : 'animate-spin-slow animate-spin-slow-paused'
                  )}
                  sizes="48px"
                  fallback={<div className="flex h-full items-center justify-center text-text-muted"><Music className="h-4 w-4 md:h-5 md:w-5" /></div>}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-text-muted">
                  <Music className="h-4 w-4 md:h-5 md:w-5" />
                </div>
              )}
            </div>
            <div className="min-w-0 text-left flex-1">
              {isAdPlaying && currentAd ? (
                <>
                  <p className="text-sm font-medium text-primary truncate">Publicité</p>
                  <p className="text-xs text-text-secondary truncate">{currentAd.sponsor} — {currentAd.text}</p>
                </>
              ) : currentTrack ? (
                <>
                  <p className="text-sm font-medium text-text-primary truncate flex items-center gap-1.5">
                    {currentTrack.title}
                    {currentTrack.isExplicit && (
                      <span className="shrink-0 px-1 py-0.5 rounded-sm bg-red-500/10 text-red-500 text-[10px] font-bold leading-none">E</span>
                    )}
                    {currentTrack.isPremiumOnly && (
                      <span className="shrink-0 px-1 py-0.5 rounded-sm bg-primary/10 text-primary text-[10px] font-bold leading-none">HQ</span>
                    )}
                  </p>
                  {currentTrack.album && (
                    <Link
                      href={`/artist/${currentTrack.album.artist.slug}`}
                      className="text-xs text-text-secondary hover:text-primary transition-colors truncate inline-flex items-center gap-1 max-w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="truncate">{currentTrack.album.artist.name}</span>
                      {currentTrack.album.artist.isVerified && <BadgeCheck className="h-3 w-3 shrink-0 text-primary" />}
                    </Link>
                  )}
                </>
              ) : null}
            </div>
            {currentTrack && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleLike(); }}
                className={cn(
                  'shrink-0 p-1.5 rounded-full transition-all duration-200 hidden md:block',
                  likeAnim && 'animate-pop',
                  isLiked
                    ? 'text-primary hover:text-primary-hover'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                <Heart className="h-4 w-4" fill={isLiked ? 'currentColor' : 'none'} />
              </button>
            )}
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
                    : isAdPlaying
                    ? 'bg-primary text-white hover:bg-primary-hover'
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
                <span className="text-xs text-text-muted w-8 text-right hidden md:block tabular-nums">
                  {formatDuration(progress)}
                </span>
                <div
                  className={cn(
                    'flex-1 h-1 rounded-full cursor-pointer group relative',
                    isAdPlaying ? 'bg-primary/20' : 'bg-surface-hover'
                  )}
                  onClick={handleProgressClick}
                >
                  <div
                    className={cn(
                      'h-full rounded-full transition-colors',
                      error ? 'bg-error' : 'bg-primary'
                    )}
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow-md shadow-black/40 transition-transform duration-150 group-hover:scale-125" />
                  </div>
                </div>
                <span className="text-xs text-text-muted w-8 hidden md:block tabular-nums">
                  {formatDuration(duration)}
                </span>
                {/* Wave bars on the right */}
                {isPlaying && !isAdPlaying && (
                  <div className="hidden md:flex items-end gap-[2px] h-3 ml-1">
                    <span className="w-0.5 bg-primary rounded-full animate-wave" style={{ animationDelay: '0s', height: '100%' }} />
                    <span className="w-0.5 bg-primary rounded-full animate-wave" style={{ animationDelay: '0.15s', height: '70%' }} />
                    <span className="w-0.5 bg-primary rounded-full animate-wave" style={{ animationDelay: '0.3s', height: '50%' }} />
                  </div>
                )}
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
          <div className="mt-2 space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-center gap-6 flex-1">
              {/* Cover */}
              <div className="hidden md:flex items-center justify-center">
                <div className="relative h-24 w-24 rounded-full overflow-hidden bg-surface-hover shadow-xl shadow-black/30 ring-2 ring-border">
                  {currentTrack?.album?.coverImage ? (
                    <SafeImage
                      src={currentTrack.album.coverImage}
                      alt={currentTrack.album.title}
                      fill
                      className={cn(
                        'object-cover',
                        isPlaying ? 'animate-spin-slow' : 'animate-spin-slow animate-spin-slow-paused'
                      )}
                      sizes="96px"
                      fallback={<Music className="h-8 w-8 text-text-muted m-auto" />}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-text-muted">
                      <Music className="h-8 w-8" />
                    </div>
                  )}
                </div>
              </div>

              {/* Controls + progress */}
              <div className="flex flex-col items-center gap-3 flex-1 max-w-md">
                <div className="flex items-center gap-2 w-full">
                  <span className="text-xs text-text-muted w-10 text-right tabular-nums">
                    {formatDuration(progress)}
                  </span>
                  <div
                    className={cn(
                      'flex-1 h-2 rounded-full cursor-pointer group relative',
                      isAdPlaying ? 'bg-primary/20' : 'bg-surface-hover'
                    )}
                    onClick={handleProgressClick}
                  >
                    <div
                      className={cn(
                        'h-full rounded-full',
                        error ? 'bg-error' : 'bg-primary'
                      )}
                      style={{ width: `${progressPercent}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white shadow-md shadow-black/40 transition-transform duration-150 group-hover:scale-125" />
                    </div>
                  </div>
                  <span className="text-xs text-text-muted w-10 tabular-nums">
                    {formatDuration(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <button onClick={toggleShuffle} className={cn('text-text-muted hover:text-text-primary p-2 transition-colors', shuffle && 'text-primary')}>
                    <Shuffle className="h-5 w-5" />
                  </button>
                  <button onClick={prev} className="text-text-secondary hover:text-text-primary p-2 transition-colors">
                    <SkipBack className="h-6 w-6" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95',
                      error ? 'bg-error/20 text-error' : 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20'
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
                  <button onClick={next} className="text-text-secondary hover:text-text-primary p-2 transition-colors">
                    <SkipForward className="h-6 w-6" />
                  </button>
                  <button onClick={toggleRepeat} className={cn('text-text-muted hover:text-text-primary p-2 transition-colors', repeat && 'text-primary')}>
                    <Repeat className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Like + Queue */}
              <div className="hidden md:flex flex-col items-center gap-3 w-20">
                {currentTrack && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(); }}
                    className={cn(
                      'p-2 rounded-full transition-all duration-200',
                      likeAnim && 'animate-pop',
                      isLiked ? 'text-primary hover:text-primary-hover' : 'text-text-muted hover:text-text-primary'
                    )}
                  >
                    <Heart className="h-6 w-6" fill={isLiked ? 'currentColor' : 'none'} />
                  </button>
                )}
                <button className="text-text-muted hover:text-text-primary p-2 transition-colors">
                  <ListMusic className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      )}
    </>
  );
}

function recordListen(trackId: string) {
  fetch('/api/user/listen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trackId }),
  }).catch(() => {});
}

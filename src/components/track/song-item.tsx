'use client';

import { memo, useState, useRef, useEffect } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import { cn } from '@/lib/utils';

interface SongItemProps {
  id: string;
  title: string;
  artist: string;
  cover: string | null;
  duration: number;
  isPlaying?: boolean;
  isLiked?: boolean;
  onPlay?: (id: string) => void;
  onMenu?: (id: string) => void;
  artistSlug?: string;
}

function EqualizerBars() {
  return (
    <div className="inline-flex items-end gap-[2px] h-4 w-5 align-middle mr-2">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[3px] bg-[#1DB954] rounded-full"
          style={{
            height: '100%',
            animation: `equalizer ${0.5 + i * 0.12}s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
            transformOrigin: 'bottom',
          }}
        />
      ))}
    </div>
  );
}

export const SongItem = memo(function SongItem({
  id,
  title,
  artist,
  cover,
  isPlaying = false,
  onPlay,
  onMenu,
}: SongItemProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      role="listitem"
      className={cn(
        'flex items-center gap-4 px-4 h-[78px] sm:h-[84px]',
        'transition-colors duration-200 ease',
        'hover:bg-white/[0.05] active:bg-white/[0.08] cursor-pointer',
        isPlaying && 'bg-[rgba(29,185,84,0.06)]',
        !mounted && 'opacity-0',
        mounted && 'opacity-100 transition-opacity duration-300'
      )}
      onClick={() => onPlay?.(id)}
    >
      <div className="relative w-[58px] h-[58px] shrink-0">
        {!visible || !cover ? (
          <div className="w-full h-full rounded-[8px] bg-white/10 animate-pulse" />
        ) : (
          <>
            {isPlaying && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-[8px]">
                <EqualizerBars />
              </div>
            )}
            <SafeImage
              src={cover}
              alt={`${title} cover`}
              fill
              className={cn(
                'rounded-[8px] object-cover',
                isPlaying && 'opacity-70'
              )}
              sizes="58px"
              fallback={<div className="w-full h-full rounded-[8px] bg-white/10" />}
            />
          </>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'font-semibold text-[20px] leading-tight truncate',
            isPlaying ? 'text-[#1DB954]' : 'text-white'
          )}
        >
          {isPlaying && <EqualizerBars />}
          {title}
        </p>
        <p className="text-[#B3B3B3] text-[16px] mt-[4px] truncate">
          {artist}
        </p>
      </div>

      <button
        onClick={() => onMenu?.(id)}
        className="flex items-center justify-center w-11 h-11 shrink-0 text-[#B3B3B3] hover:text-white transition-colors duration-200 rounded-full active:bg-white/10"
        aria-label={`Menu for ${title}`}
        tabIndex={0}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </button>

      <style jsx global>{`
        @keyframes equalizer {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
});

export function SongItemSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 h-[78px] sm:h-[84px] animate-pulse">
      <div className="w-[58px] h-[58px] rounded-[8px] bg-white/10 shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-5 w-3/5 bg-white/10 rounded" />
        <div className="h-4 w-2/5 bg-white/10 rounded" />
      </div>
      <div className="w-11 h-11 shrink-0" />
    </div>
  );
}

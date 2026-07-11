'use client';

import { useRef, useCallback } from 'react';
import { SongItem, SongItemSkeleton } from '@/components/track/song-item';
import { cn } from '@/lib/utils';

export interface MusicListItem {
  id: string;
  title: string;
  artist: string;
  cover: string | null;
  duration: number;
  isLiked?: boolean;
  artistSlug?: string;
}

interface MusicListProps {
  items: MusicListItem[];
  isPlaying?: boolean;
  currentId?: string | null;
  onPlay?: (id: string) => void;
  onMenu?: (id: string) => void;
  loading?: boolean;
  skeletonCount?: number;
  className?: string;
}

export function MusicList({
  items,
  isPlaying,
  currentId,
  onPlay,
  onMenu,
  loading = false,
  skeletonCount = 6,
  className,
}: MusicListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let nextIndex = index;
      if (e.key === 'ArrowDown') nextIndex = Math.min(index + 1, items.length - 1);
      else if (e.key === 'ArrowUp') nextIndex = Math.max(index - 1, 0);
      else return;

      e.preventDefault();
      const children = listRef.current?.children;
      if (children && children[nextIndex]) {
        (children[nextIndex] as HTMLElement).focus();
      }
    },
    [items.length]
  );

  if (loading) {
    return (
      <div
        ref={listRef}
        role="list"
        className={cn('bg-[#121212]', className)}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SongItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        role="list"
        className={cn('bg-[#121212]', className)}
      >
        <div className="flex flex-col items-center justify-center py-16 text-[#B3B3B3]">
          <p className="text-lg font-medium">No songs yet</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      role="list"
      className={cn('bg-[#121212]', className)}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          role="listitem"
          tabIndex={0}
          onKeyDown={(e) => handleKeyDown(e, index)}
        >
          <SongItem
            id={item.id}
            title={item.title}
            artist={item.artist}
            cover={item.cover}
            duration={item.duration}
            isPlaying={currentId === item.id && isPlaying}
            isLiked={item.isLiked}
            onPlay={onPlay}
            onMenu={onMenu}
            artistSlug={item.artistSlug}
          />
        </div>
      ))}
    </div>
  );
}

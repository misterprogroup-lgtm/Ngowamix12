'use client';

import { useState, useEffect, useRef } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import { User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoryItem {
  id: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  caption?: string | null;
}

interface StoryGroup {
  artist: {
    id: string;
    name: string;
    slug: string;
    avatar: string | null;
    isVerified: boolean;
  };
  stories: StoryItem[];
  allViewed: boolean;
}

export function StoryCircles() {
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<StoryGroup | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch('/api/stories')
      .then(r => r.json())
      .then(data => { setGroups(data.groups || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const openStory = (group: StoryGroup) => {
    setActiveGroup(group);
    setActiveIndex(0);
  };

  const closeStory = () => {
    setActiveGroup(null);
    setActiveIndex(0);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const goNext = () => {
    if (!activeGroup) return;
    if (activeIndex < activeGroup.stories.length - 1) {
      setActiveIndex(i => i + 1);
    } else {
      closeStory();
    }
  };

  const goPrev = () => {
    if (!activeGroup) return;
    if (activeIndex > 0) {
      setActiveIndex(i => i - 1);
    }
  };

  useEffect(() => {
    if (!activeGroup) return;
    timerRef.current = setTimeout(goNext, 30000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activeGroup, activeIndex]);

  if (loading) {
    return (
      <div className="flex gap-4 px-4 md:px-8 py-4 overflow-x-auto scrollbar-hide">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="h-16 w-16 rounded-full bg-surface-hover animate-pulse" />
            <div className="h-3 w-12 rounded bg-surface-hover animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) return null;

  return (
    <>
      <div className="flex gap-4 px-4 md:px-8 py-4 overflow-x-auto scrollbar-hide">
        {groups.map((group) => (
          <button
            key={group.artist.id}
            onClick={() => openStory(group)}
            className="flex flex-col items-center gap-1.5 shrink-0 group"
          >
            <div className={cn(
              'h-16 w-16 rounded-full p-[2.5px] transition-colors',
              group.allViewed ? 'bg-border/30' : 'bg-linear-to-br from-primary to-accent'
            )}>
              <div className="h-full w-full rounded-full overflow-hidden bg-surface ring-2 ring-background">
                <SafeImage
                  src={group.artist.avatar || ''}
                  alt={group.artist.name}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                  fallback={
                    <div className="flex h-full items-center justify-center text-text-muted">
                      <User className="h-6 w-6" />
                    </div>
                  }
                />
              </div>
            </div>
            <span className="text-[10px] text-text-muted truncate max-w-[64px]">
              {group.artist.name}
            </span>
          </button>
        ))}
      </div>

      {/* Viewer overlay */}
      {activeGroup && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col" onClick={closeStory}>
          <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
            {activeGroup.stories.map((_, i) => (
              <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                <div className={cn(
                  'h-full bg-white rounded-full transition-all duration-100',
                  i < activeIndex ? 'w-full' : i === activeIndex ? 'w-full animate-[shrink_5s_linear]' : 'w-0'
                )} />
              </div>
            ))}
          </div>

          <div className="absolute top-3 left-3 z-10 flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <div className="h-9 w-9 rounded-full overflow-hidden bg-surface ring-2 ring-white/20">
              <SafeImage
                src={activeGroup.artist.avatar || ''}
                alt={activeGroup.artist.name}
                width={36}
                height={36}
                className="object-cover w-full h-full"
                fallback={<div className="flex h-full items-center justify-center text-white/60"><User className="h-4 w-4" /></div>}
              />
            </div>
            <span className="text-sm font-semibold text-white">{activeGroup.artist.name}</span>
          </div>

          <div className="flex-1 flex items-center justify-center relative" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 flex" onClick={goPrev}>
              <div className="w-1/3 h-full" />
            </div>
            <div className="absolute inset-0 flex" onClick={goNext}>
              <div className="w-2/3 h-full ml-auto" />
            </div>

            {activeGroup.stories[activeIndex]?.mediaType === 'VIDEO' ? (
              <video
                src={activeGroup.stories[activeIndex].mediaUrl}
                className="max-h-full max-w-full object-contain"
                autoPlay
                playsInline
                onEnded={goNext}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeGroup.stories[activeIndex]?.mediaUrl}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            )}

            {activeGroup.stories[activeIndex]?.caption && (
              <div className="absolute bottom-8 left-4 right-4 text-center">
                <p className="text-sm text-white/90 bg-black/40 px-4 py-2 rounded-lg inline-block backdrop-blur-sm">
                  {activeGroup.stories[activeIndex].caption}
                </p>
              </div>
            )}
          </div>

          <style jsx>{`
            @keyframes shrink {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}

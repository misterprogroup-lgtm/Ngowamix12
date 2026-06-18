'use client';

import { useState, useEffect, useCallback } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import { cn } from '@/lib/utils';

const SLIDES = [
  '/images/slide/slide-1.jpg',
  '/images/slide/slide-2.jpg',
  '/images/slide/slide-3.jpg',
];

export function SinglesCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [next]);

  return (
    <div className="relative h-56 md:h-96 overflow-hidden">
      {SLIDES.map((src, index) => (
        <div
          key={index}
          className={cn(
            'absolute inset-0 transition-all duration-700 ease-in-out',
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          )}
        >
          <SafeImage
            src={src}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/20 to-transparent" />
        </div>
      ))}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              index === current
                ? 'w-6 bg-primary'
                : 'w-1.5 bg-white/40 hover:bg-white/60'
            )}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

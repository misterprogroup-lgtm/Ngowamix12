'use client';

import { useRef, useState, useEffect, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  children: ReactNode;
  gap?: number;
  className?: string;
}

export function Carousel({ children, gap = 16, className = '' }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 10);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows);
    return () => el.removeEventListener('scroll', updateArrows);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className={`relative group/carousel ${className}`}>
      {showLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-[#ff9900] text-black flex items-center justify-center shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 hover:bg-[#e68a00]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide snap-scroll-container"
        style={{ gap, scrollSnapType: 'x mandatory' }}
      >
        {children}
      </div>
      {showRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-[#ff9900] text-black flex items-center justify-center shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 hover:bg-[#e68a00]"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

'use client';

import { useRef, useState, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface HorizontalScrollProps {
  children: ReactNode;
  title?: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  description?: string;
  seeAllHref?: string;
  className?: string;
  withPadding?: boolean;
}

export function HorizontalScroll({ children, title, subtitle, icon, description, seeAllHref, className = '', withPadding = true }: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className={className} role="region" aria-label={typeof title === 'string' ? title : undefined}>
      {(title || seeAllHref) && (
        <div className="flex items-center justify-between mb-6">
          {title && (
            <div>
              <div className="flex items-center gap-2">
                {icon && <span>{icon}</span>}
                  <h2 className="text-2xl font-bold">{title}</h2>
              </div>
              {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
            </div>
          )}
          <div className="flex items-center gap-3">
            {(canScrollLeft || canScrollRight) && (
              <div className="hidden md:flex items-center gap-1">
                {canScrollLeft && (
                  <button
                    onClick={() => scroll('left')}
                    className="h-9 w-9 rounded-full bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                    aria-label="Précédent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}
                {canScrollRight && (
                  <button
                    onClick={() => scroll('right')}
                    className="h-9 w-9 rounded-full bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                    aria-label="Suivant"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
            {seeAllHref && (
              <Link href={seeAllHref} className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1 shrink-0">
                Voir tout <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      )}
      {description && <p className="text-text-secondary mb-8 max-w-2xl">{description}</p>}
      <div className="relative">
        <div
          ref={scrollRef}
          className={`flex overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory snap-scroll-container ${withPadding ? '-mx-4 px-4' : ''}`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-x pinch-zoom', overscrollBehaviorX: 'contain' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

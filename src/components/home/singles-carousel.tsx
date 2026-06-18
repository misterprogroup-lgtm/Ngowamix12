'use client';

import { useState, useEffect, useCallback } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import Link from 'next/link';
import { Play, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SLIDES = [
  { src: '/images/slide/slide-1.jpg', title: 'Découvrez la musique africaine', subtitle: 'Streaming gratuit, Premium à 1500 FCFA/mois', cta: 'Explorer', href: '/explore' },
  { src: '/images/slide/slide-2.jpg', title: 'Artistes africains à l\'honneur', subtitle: 'Des milliers de titres Afrobeats, Amapiano, Coupé-décalé...', cta: 'Écouter', href: '/explore' },
  { src: '/images/slide/slide-3.jpg', title: 'Rejoignez la communauté', subtitle: 'Créez vos playlists, suivez vos artistes, achetez des albums', cta: 'S\'inscrire', href: '/register' },
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
    <div className="relative h-[50vh] md:h-[70vh] min-h-[400px] md:min-h-[500px] overflow-hidden">
      {SLIDES.map((slide, index) => (
        <div
          key={index}
          className={cn(
            'absolute inset-0 transition-all duration-700 ease-in-out',
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          )}
        >
          <SafeImage
            src={slide.src}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
          <div className={cn(
            'absolute bottom-12 md:bottom-20 left-6 md:left-12 z-20 max-w-xl transition-all duration-700',
            index === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          )}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight">
              {slide.title}
            </h2>
            <p className="text-base md:text-lg text-white/80 mb-6 max-w-md">
              {slide.subtitle}
            </p>
            <Link href={slide.href}>
              <Button variant="primary" size="lg" className="rounded-full text-base">
                <Play className="h-5 w-5 fill-current" />
                {slide.cta}
              </Button>
            </Link>
          </div>
        </div>
      ))}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={cn(
              'rounded-full transition-all duration-300',
              index === current
                ? 'w-8 h-2 bg-primary'
                : 'w-2 h-2 bg-white/40 hover:bg-white/60'
            )}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

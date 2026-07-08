'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { Crown, Upload, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME, PREMIUM_PRICE, PREMIUM_CURRENCY } from '@/lib/constants';

const slides = [
  {
    badge: 'Premium',
    badgeColor: 'text-primary border-primary/20 bg-primary/10',
    dotColor: 'bg-primary',
    title: (
      <>
        Passez au{' '}
        <span className="text-primary">Premium</span>
      </>
    ),
    description: 'Écoute sans publicité, téléchargements illimités et qualité audio supérieure.',
    cta: (
      <Link href="/premium">
        <Button
          size="lg"
          className="bg-primary hover:bg-primary-hover text-black rounded-full font-bold px-7 h-[52px] text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
        >
          <Crown className="h-5 w-5" />
          S&apos;abonner — {PREMIUM_PRICE} {PREMIUM_CURRENCY}/mois
        </Button>
      </Link>
    ),
    icon: Crown,
    gradient: 'from-primary/10 via-[#0b0b0b] to-[#0b0b0b]',
  },
  {
    badge: 'Artistes',
    badgeColor: 'text-[#8b5cf6] border-[#8b5cf633] bg-[#8b5cf611]',
    dotColor: 'bg-[#8b5cf6]',
    title: (
      <>
        Publiez et{' '}
        <span className="text-[#8b5cf6]">gagnez</span>
      </>
    ),
    description: 'Uploader votre musique, touchez des royalties et développez votre audience.',
    cta: (
      <Link href="/artist/upload">
        <Button
          size="lg"
          className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-full font-bold px-7 h-[52px] text-sm shadow-lg shadow-[#8b5cf6]/25 hover:shadow-[#8b5cf6]/40 transition-all duration-300"
        >
          <Upload className="h-5 w-5" />
          Commencer maintenant
        </Button>
      </Link>
    ),
    icon: DollarSign,
    gradient: 'from-[#8b5cf611] via-[#0b0b0b] to-[#0b0b0b]',
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br border border-[#ffffff08] min-h-[340px] md:min-h-[360px]"
      style={{ backgroundImage: `linear-gradient(to bottom right, ${slide.gradient})` }}
    >
      <div className="absolute top-0 right-0 w-72 h-72 bg-white opacity-[0.02] rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white opacity-[0.02] rounded-full blur-3xl" />

      <div className="relative p-6 md:p-10 lg:p-12">
        <div className="max-w-2xl space-y-5 min-h-[200px] md:min-h-[220px]">
          <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${slide.badgeColor}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${slide.dotColor} animate-pulse`} />
            <span className="text-[11px] font-bold uppercase tracking-wider">{slide.badge}</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-white">
            {slide.title}
          </h1>

          <p className="text-sm md:text-base text-[#ccc] leading-relaxed max-w-md">
            {slide.description}
          </p>

          <div className="pt-1">
            {slide.cta}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current
                ? `${slides[i].dotColor} w-6`
                : 'bg-[#ffffff20] w-2 hover:bg-[#ffffff40]'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

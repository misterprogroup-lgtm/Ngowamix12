'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Crown, Upload, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [isVisible, next]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
      if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
    };
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [prev, next]);

  const slide = slides[current];

  return (
    <section
      ref={sectionRef}
      tabIndex={0}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br border border-[#ffffff08] min-h-[340px] md:min-h-[360px] focus:outline-none focus:ring-2 focus:ring-primary/50"
      style={{ backgroundImage: `linear-gradient(to bottom right, ${slide.gradient})` }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotions"
    >
      <div className="absolute top-0 right-0 w-72 h-72 bg-white opacity-[0.02] rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white opacity-[0.02] rounded-full blur-3xl" />

      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity group-hover/carousel:opacity-100"
        aria-label="Slide précédent"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity group-hover/carousel:opacity-100"
        aria-label="Slide suivant"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        className="relative p-6 md:p-10 lg:p-12"
        aria-live="polite"
        aria-atomic="true"
      >
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

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="relative"
            aria-label={`Slide ${i + 1}`}
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                i === current
                  ? `${slides[i].dotColor} w-6`
                  : 'bg-[#ffffff20] w-2 hover:bg-[#ffffff40]'
              }`}
              style={{ height: '8px' }}
            />
          </button>
        ))}
      </div>
    </section>
  );
}

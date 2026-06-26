'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { Crown, Download, Upload, Music, Smartphone, Headphones, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME, PREMIUM_PRICE, PREMIUM_CURRENCY } from '@/lib/constants';

const slides = [
  {
    badge: 'Application mobile',
    badgeColor: 'text-[#22c55e] border-[#22c55e33] bg-[#22c55e11]',
    dotColor: 'bg-[#22c55e]',
    title: (
      <>
        Téléchargez{' '}
        <span className="text-[#22c55e]">{APP_NAME}</span>
      </>
    ),
    description: 'Écoutez votre musique préférée partout, même hors ligne.',
    cta: (
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#141414] border border-[#ffffff12] text-white hover:border-[#22c55e66] hover:bg-[#1a1a1a] transition-all group"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          <div>
            <p className="text-[10px] text-[#888] leading-tight">Télécharger sur</p>
            <p className="text-sm font-bold text-white group-hover:text-[#22c55e] transition-colors">App Store</p>
          </div>
        </a>
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#141414] border border-[#ffffff12] text-white hover:border-[#22c55e66] hover:bg-[#1a1a1a] transition-all group"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 010 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
          </svg>
          <div>
            <p className="text-[10px] text-[#888] leading-tight">Disponible sur</p>
            <p className="text-sm font-bold text-white group-hover:text-[#22c55e] transition-colors">Google Play</p>
          </div>
        </a>
      </div>
    ),
    icon: Smartphone,
    gradient: 'from-[#22c55e11] via-[#0b0b0b] to-[#0b0b0b]',
  },
  {
    badge: 'Premium',
    badgeColor: 'text-[#ff9900] border-[#ff990033] bg-[#ff990011]',
    dotColor: 'bg-[#ff9900]',
    title: (
      <>
        Passez au{' '}
        <span className="text-[#ff9900]">Premium</span>
      </>
    ),
    description: 'Écoute sans publicité, téléchargements illimités et qualité audio supérieure.',
    cta: (
      <Link href="/premium">
        <Button
          size="lg"
          className="bg-[#ff9900] hover:bg-[#e68a00] text-black rounded-full font-bold px-7 h-[52px] text-sm shadow-lg shadow-[#ff9900]/25 hover:shadow-[#ff9900]/40 transition-all duration-300"
        >
          <Crown className="h-5 w-5" />
          S&apos;abonner — {PREMIUM_PRICE} {PREMIUM_CURRENCY}/mois
        </Button>
      </Link>
    ),
    icon: Crown,
    gradient: 'from-[#ff990011] via-[#0b0b0b] to-[#0b0b0b]',
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

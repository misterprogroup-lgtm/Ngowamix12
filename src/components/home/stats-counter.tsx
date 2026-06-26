'use client';

import { useState, useEffect, useRef } from 'react';
import { Music, Users, Headphones, Album } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface Stats {
  artists: number;
  tracks: number;
  albums: number;
  users: number;
}

function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{formatNumber(count)}{suffix}</span>;
}

const statsConfig = [
  { key: 'tracks', icon: Music, label: 'Titres disponibles', color: 'from-orange-500 to-amber-500' },
  { key: 'artists', icon: Users, label: 'Artistes', color: 'from-purple-500 to-pink-500' },
  { key: 'albums', icon: Album, label: 'Albums & Singles', color: 'from-blue-500 to-cyan-500' },
  { key: 'users', icon: Headphones, label: 'Auditeurs', color: 'from-green-500 to-emerald-500' },
] as const;

export function StatsCounter({ tracks, artists, albums, users }: Stats) {
  const allZero = tracks === 0 && artists === 0 && albums === 0 && users === 0;
  if (allZero) return null;

  const stats = { tracks, artists, albums, users };

  return (
    <section className="py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {statsConfig.map(({ key, icon: Icon, label, color }) => {
          const value = stats[key];
          if (value === 0) return null;
          return (
            <div
              key={key}
              className="relative overflow-hidden rounded-xl border border-[#ffffff08] bg-[#0b0b0b] p-6 text-center group hover:border-[#ff990033] transition-colors"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full bg-linear-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <div className={`w-10 h-10 rounded-lg bg-linear-to-br ${color} flex items-center justify-center mx-auto mb-3`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                <Counter value={value} />
              </p>
              <p className="text-sm text-[#777]">{label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

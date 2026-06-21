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

  return (
    <span ref={ref}>
      {formatNumber(count)}{suffix}
    </span>
  );
}

const statsConfig = [
  { key: 'tracks', icon: Music, label: 'Titres disponibles', color: 'from-orange-500 to-amber-500' },
  { key: 'artists', icon: Users, label: 'Artistes', color: 'from-purple-500 to-pink-500' },
  { key: 'albums', icon: Album, label: 'Albums & Singles', color: 'from-blue-500 to-cyan-500' },
  { key: 'users', icon: Headphones, label: 'Auditeurs', color: 'from-green-500 to-emerald-500' },
] as const;

export function StatsCounter() {
  const [stats, setStats] = useState<Stats>({ tracks: 0, artists: 0, albums: 0, users: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/public/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats({
          tracks: data.tracks || 0,
          artists: data.artists || 0,
          albums: data.albums || 0,
          users: data.users || 0,
        });
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statsConfig.map(({ key, icon: Icon, label, color }) => {
            const value = stats[key as keyof Stats];
            if (value === 0) return null;
            return (
              <div
                key={key}
                className="relative overflow-hidden rounded-xl border border-border bg-surface p-6 text-center group hover:border-primary/30 transition-colors"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full bg-linear-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <div className={`w-10 h-10 rounded-lg bg-linear-to-br ${color} flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-3xl font-bold text-text-primary mb-1">
                  <Counter value={value} />
                </p>
                <p className="text-sm text-text-secondary">{label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { Play, Music } from 'lucide-react';

interface FeaturedItem {
  id: string;
  title: string;
  artist: string;
  cover: string | null;
  type?: 'album' | 'track';
}

export function FeaturedBanner({ item }: { item: FeaturedItem | null }) {
  if (!item) return null;

  const href = item.type === 'album' ? `/album/${item.id}` : `/track/${item.id}`;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#ffffff08]">
      <div className="flex items-center gap-6 p-4 md:p-6">
        <div className="relative w-28 h-28 md:w-36 md:h-36 shrink-0 rounded-xl overflow-hidden bg-[#141414] shadow-2xl border border-[#ffffff15]">
          <SafeImage
            src={item.cover || ''}
            alt={item.title}
            fill
            sizes="144px"
            className="object-cover"
            fallback={
              <div className="flex h-full items-center justify-center text-[#555]">
                <Music className="h-10 w-10" />
              </div>
            }
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#ff9900] mb-1.5">
            {item.type === 'album' ? 'Album à la une' : 'Titre à la une'}
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-white truncate mb-1">
            {item.title}
          </h2>
          <p className="text-sm text-[#999] truncate mb-4">
            {item.artist}
          </p>
          <Link
            href={href}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ff9900] text-black text-sm font-bold hover:bg-[#e68a00] transition-colors"
          >
            <Play className="h-4 w-4 fill-current" />
            Écouter
          </Link>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff9900] opacity-[0.03] rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

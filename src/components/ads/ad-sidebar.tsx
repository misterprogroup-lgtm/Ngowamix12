'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Megaphone } from 'lucide-react';

interface AdData {
  id: string;
  image: string;
  sponsor: string;
  text: string;
  link: string | null;
  placement: string;
}

export function AdSidebar() {
  const [ad, setAd] = useState<AdData | null>(null);

  useEffect(() => {
    fetch('/api/ads?placement=SIDEBAR')
      .then((r) => r.json())
      .then((data) => {
        if (data.length > 0) setAd(data[0]);
      })
      .catch(() => {});
  }, []);

  if (!ad) return null;

  const content = (
    <div className="rounded-xl overflow-hidden border border-border bg-surface-hover">
      <div className="relative h-32">
        <img src={ad.image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-3 right-3">
          <p className="text-xs text-primary font-semibold uppercase tracking-wider">
            Sponsorisé
          </p>
          <p className="text-xs text-white font-medium mt-0.5">{ad.sponsor}</p>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm text-text-secondary">{ad.text}</p>
        {ad.link && (
          <Link href={ad.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline">
            <Megaphone className="h-3 w-3" />
            En savoir plus
          </Link>
        )}
      </div>
    </div>
  );

  if (ad.link) {
    return <Link href={ad.link} target="_blank" rel="noopener noreferrer">{content}</Link>;
  }

  return content;
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Megaphone } from 'lucide-react';

interface AdData {
  id: string;
  image: string;
  sponsor: string;
  text: string;
  link: string | null;
  placement: string;
}

export function AdBanner() {
  const [ad, setAd] = useState<AdData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismissedIds = JSON.parse(sessionStorage.getItem('ngowamix-banner-dismissed') || '[]');
    fetch('/api/ads?placement=BANNER')
      .then((r) => r.json())
      .then((data) => {
        const available = data.find((a: AdData) => !dismissedIds.includes(a.id));
        if (available) setAd(available);
      })
      .catch(() => {});
  }, []);

  if (!ad || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      const dismissedIds = JSON.parse(sessionStorage.getItem('ngowamix-banner-dismissed') || '[]');
      dismissedIds.push(ad.id);
      sessionStorage.setItem('ngowamix-banner-dismissed', JSON.stringify(dismissedIds));
    } catch {}
  };

  const content = (
    <div className="relative rounded-xl overflow-hidden bg-surface-hover border border-border">
      <div className="flex items-center gap-4 p-4">
        <div className="h-16 w-24 rounded-lg overflow-hidden bg-surface shrink-0">
          <img src={ad.image} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-primary font-semibold uppercase tracking-wider">
            <Megaphone className="h-3 w-3 inline mr-1" />
            Sponsorisé · {ad.sponsor}
          </p>
          <p className="text-sm font-medium mt-0.5">{ad.text}</p>
        </div>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDismiss(); }} className="p-1.5 text-text-muted hover:text-text-primary rounded-full hover:bg-surface transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  if (ad.link) {
    return (
      <Link href={ad.link} target="_blank" rel="noopener noreferrer">
        {content}
      </Link>
    );
  }

  return content;
}

'use client';

import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title: string;
}

export function ShareButton({ url, title }: ShareButtonProps) {
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const fullUrl = `${window.location.origin}${url}`;

    if (navigator.share) {
      navigator.share({ title, url: fullUrl }).catch(() => {});
    } else {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
      title="Partager"
    >
      <Share2 className="h-4 w-4" />
    </button>
  );
}

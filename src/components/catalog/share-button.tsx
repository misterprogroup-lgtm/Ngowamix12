'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { ShareModal } from '@/components/catalog/share-modal';

interface ShareButtonProps {
  url: string;
  title: string;
  artistName?: string;
  coverImage?: string | null;
  type?: 'track' | 'album' | 'playlist';
}

export function ShareButton({ url, title, artistName, coverImage, type = 'album' }: ShareButtonProps) {
  const [showShare, setShowShare] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShare(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
        title="Partager"
      >
        <Share2 className="h-4 w-4" />
      </button>
      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        url={url}
        title={title}
        artistName={artistName}
        coverImage={coverImage}
        type={type}
      />
    </>
  );
}

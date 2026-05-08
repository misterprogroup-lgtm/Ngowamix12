'use client';

import { useState } from 'react';
import { Play, ShoppingBag, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { Track } from '@/types';
import { usePlayerStore } from '@/store/player-store';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

interface AlbumActionsProps {
  album: {
    id: string;
    title: string;
    type: string;
    price: number;
    isPremiumOnly: boolean;
    coverImage: string | null;
    artist: { id?: string; name: string; slug: string; avatar?: string | null };
  };
  tracks: any[];
  isPurchased: boolean;
}

export function AlbumActions({ album, tracks, isPurchased }: AlbumActionsProps) {
  const { play } = usePlayerStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [buying, setBuying] = useState(false);

  const buildTrack = (t: any): Track => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    trackNumber: t.trackNumber,
    duration: t.duration,
    audioFile: t.audioFile,
    isExplicit: t.isExplicit,
    isPremiumOnly: t.isPremiumOnly,
    playCount: t.playCount,
    album: {
      id: album.id,
      title: album.title,
      coverImage: album.coverImage,
      artist: {
        id: album.artist.id || '',
        name: album.artist.name,
        slug: album.artist.slug,
        avatar: album.artist.avatar || null,
      },
    },
  });

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      const queue = tracks.map(buildTrack);
      play(queue[0], queue, 0);
    }
  };

  const handleBuy = async () => {
    if (!user) {
      router.push(`${ROUTES.LOGIN}?redirect=/album/${album.id}`);
      return;
    }

    setBuying(true);
    try {
      const res = await fetch('/api/payment/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: album.price,
          description: `Achat de l'album : ${album.title}`,
          type: 'ALBUM_PURCHASE',
          productId: album.id,
          paymentMethod: 'MOBILE_MONEY',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du paiement');
      }

      window.location.href = data.paymentUrl;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors du paiement');
    } finally {
      setBuying(false);
    }
  };

  const handleDownload = async () => {
    if (tracks.length === 0) return;

    for (const track of tracks) {
      const link = document.createElement('a');
      link.href = track.audioFile;
      link.download = `${album.artist.name} - ${track.title}.mp3`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary" size="lg" onClick={handlePlayAll}>
        <Play className="h-5 w-5 mr-2" fill="currentColor" />
        Écouter
      </Button>
      {album.type === 'SINGLE' && (
        <Button variant="success" size="lg" onClick={handleDownload}>
          <Download className="h-5 w-5 mr-2" />
          Télécharger gratuitement
        </Button>
      )}
      {album.price > 0 && album.type !== 'SINGLE' && !isPurchased && (
        <Button variant="premium" size="lg" onClick={handleBuy} isLoading={buying}>
          {buying ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <ShoppingBag className="h-5 w-5 mr-2" />
          )}
          Acheter — {formatPrice(Number(album.price))}
        </Button>
      )}
    </div>
  );
}

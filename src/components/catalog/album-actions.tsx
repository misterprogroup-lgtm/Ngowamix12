'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, ShoppingBag, Download, Wifi, WifiOff, Loader2, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { Track } from '@/types';
import { usePlayerStore } from '@/store/player-store';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import {
  storeOfflineTrack,
  removeOfflineTrack,
  isAlbumOffline,
  removeOfflineAlbum,
  getAllOfflineTracks,
} from '@/lib/offline-storage';

interface AlbumTrackData {
  id: string;
  title: string;
  slug: string;
  trackNumber: number;
  duration: number;
  audioFile: string;
  isExplicit: boolean;
  isPremiumOnly: boolean;
  playCount: number;
}

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
  tracks: AlbumTrackData[];
  isPurchased: boolean;
}

export function AlbumActions({ album, tracks, isPurchased }: AlbumActionsProps) {
  const { play } = usePlayerStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [buying, setBuying] = useState(false);
  const [downloadingAlbum, setDownloadingAlbum] = useState(false);
  const [offlineAlbum, setOfflineAlbum] = useState(false);
  const [savingOffline, setSavingOffline] = useState(false);
  const [removingOffline, setRemovingOffline] = useState(false);

  useEffect(() => {
    isAlbumOffline(album.id).then(setOfflineAlbum);
  }, [album.id]);

  const buildTrack = (t: AlbumTrackData): Track => ({
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

  const handleDownloadSingle = async () => {
    if (tracks.length === 0) return;

    setSavingOffline(true);
    try {
      for (const track of tracks) {
        const res = await fetch(track.audioFile);
        if (!res.ok) continue;
        const blob = await res.blob();
        const ext = track.audioFile.match(/\.(\w+)(?:\?|$)/)?.[1] || 'mp3';
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${album.artist.name} - ${track.title}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        if (user) {
          await storeOfflineTrack(track.id, track.audioFile, {
            title: track.title,
            trackNumber: track.trackNumber,
            duration: track.duration,
            albumId: album.id,
            albumTitle: album.title,
            albumCover: album.coverImage,
            artistName: album.artist.name,
            artistSlug: album.artist.slug,
          }).catch(() => {});
        }
      }
      if (user) setOfflineAlbum(true);
    } catch {
      alert('Erreur lors du téléchargement');
    } finally {
      setSavingOffline(false);
    }
  };

  const handleDownloadAlbum = async () => {
    if (!user) {
      router.push(`${ROUTES.LOGIN}?redirect=/album/${album.id}`);
      return;
    }
    setDownloadingAlbum(true);
    try {
      const res = await fetch(`/api/user/download/zip?albumId=${album.id}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erreur' }));
        alert(err.error);
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition') || '';
      const filename = decodeURIComponent(disposition.match(/filename="(.+)"/)?.[1] || 'album.zip');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Erreur lors du téléchargement');
    } finally {
      setDownloadingAlbum(false);
    }
  };

  const canDownloadOffline = isPurchased || user?.isPremium;
  const isSingle = album.type === 'SINGLE';
  const isPaid = album.price > 0 && album.type !== 'SINGLE';

  const handleSaveOffline = useCallback(async () => {
    if (!user) {
      router.push(`${ROUTES.LOGIN}?redirect=/album/${album.id}`);
      return;
    }
    setSavingOffline(true);
    try {
      const existing = await getAllOfflineTracks();
      const existingIds = new Set(existing.map((t) => t.trackId));
      const toDownload = tracks.filter((t) => !existingIds.has(t.id));
      if (toDownload.length === 0) {
        setOfflineAlbum(true);
        return;
      }
      let done = 0;
      for (const track of toDownload) {
        await storeOfflineTrack(track.id, track.audioFile, {
          title: track.title,
          trackNumber: track.trackNumber,
          duration: track.duration,
          albumId: album.id,
          albumTitle: album.title,
          albumCover: album.coverImage,
          artistName: album.artist.name,
          artistSlug: album.artist.slug,
        });
        done++;
      }
      setOfflineAlbum(true);
    } catch (err) {
      console.error('Save offline error:', err);
      alert("Erreur lors de l'enregistrement hors-ligne");
    } finally {
      setSavingOffline(false);
    }
  }, [user, album, tracks, router]);

  const handleRemoveOffline = useCallback(async () => {
    setRemovingOffline(true);
    try {
      await removeOfflineAlbum(album.id);
      setOfflineAlbum(false);
    } catch {
      alert('Erreur lors de la suppression');
    } finally {
      setRemovingOffline(false);
    }
  }, [album.id]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary" size="lg" onClick={handlePlayAll}>
        <Play className="h-5 w-5 mr-2" fill="currentColor" />
        Écouter
      </Button>
      {isSingle && (
        <Button variant="success" size="lg" onClick={handleDownloadSingle} isLoading={savingOffline}>
          <Download className="h-5 w-5 mr-2" />
          Télécharger gratuitement
        </Button>
      )}
      {isPaid && !isPurchased && (
        <Button variant="premium" size="lg" onClick={handleBuy} isLoading={buying}>
          {buying ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <ShoppingBag className="h-5 w-5 mr-2" />
          )}
          Acheter — {formatPrice(Number(album.price))}
        </Button>
      )}
      {isPurchased && !isSingle && (
        <Button variant="success" size="lg" onClick={handleDownloadAlbum} isLoading={downloadingAlbum}>
          <Download className="h-5 w-5 mr-2" />
          Télécharger (ZIP)
        </Button>
      )}
      {canDownloadOffline && !offlineAlbum && (
        <Button variant="outline" size="lg" onClick={handleSaveOffline} isLoading={savingOffline}>
          <WifiOff className="h-5 w-5 mr-2" />
          Écouter hors-ligne
        </Button>
      )}
      {offlineAlbum && (
        <>
          <span className="flex items-center gap-1.5 text-xs text-success font-medium">
            <Check className="h-4 w-4" />
            Disponible hors-ligne
          </span>
          <Button variant="ghost" size="sm" onClick={handleRemoveOffline} isLoading={removingOffline}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}

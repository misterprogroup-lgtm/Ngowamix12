'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Download, Music, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDuration } from '@/lib/utils';

interface Purchase {
  id: string;
  amount: string;
  purchasedAt: string;
  album: {
    id: string;
    title: string;
    coverImage: string | null;
    artist: {
      name: string;
      slug: string;
    };
    _count: {
      tracks: number;
    };
  };
  transaction: {
    status: string;
    paymentMethod: string;
  };
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await fetch('/api/user/purchases');
      const data = await res.json();
      setPurchases(data.purchases || []);
    } catch (error) {
      console.error('Fetch purchases error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (albumId: string) => {
    setDownloading(albumId);
    try {
      const res = await fetch(`/api/user/download?albumId=${albumId}`);
      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      alert(`Téléchargement de "${data.album.title}" prêt. Fonctionnalité de ZIP complète bientôt disponible.`);
    } catch (error) {
      alert('Erreur lors du téléchargement');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-48 bg-surface-hover rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface-hover rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ShoppingBag className="h-6 w-6 text-accent" />
        Mes achats
      </h1>

      {purchases.length === 0 ? (
        <div className="text-center py-16">
          <Music className="h-16 w-16 text-text-muted mx-auto mb-4 opacity-50" />
          <h2 className="text-lg font-medium text-text-secondary mb-2">
            Aucun achat pour le moment
          </h2>
          <p className="text-text-muted mb-6">
            Explorez le catalogue et achetez des albums pour les télécharger
          </p>
          <Link href="/explore">
            <Button variant="primary">
              Explorer le catalogue
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="rounded-xl border border-border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {purchase.album.coverImage ? (
                <img
                  src={purchase.album.coverImage}
                  alt={purchase.album.title}
                  className="h-20 w-20 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="h-20 w-20 rounded-lg bg-surface-hover flex items-center justify-center shrink-0">
                  <Music className="h-8 w-8 text-text-muted" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Link href={`/album/${purchase.album.id}`} className="font-medium hover:text-primary transition-colors">
                  {purchase.album.title}
                </Link>
                <p className="text-sm text-text-secondary">
                  {purchase.album.artist.name} · {purchase.album._count.tracks} titres
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="success">{purchase.transaction.status}</Badge>
                  <span className="text-xs text-text-muted">
                    {purchase.transaction.paymentMethod}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-medium text-accent">
                  {formatPrice(Number(purchase.amount))}
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleDownload(purchase.album.id)}
                  isLoading={downloading === purchase.album.id}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Télécharger
                </Button>
                <Link href={`/album/${purchase.album.id}`}>
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

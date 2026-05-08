'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Music, Play, ShoppingBag, TrendingUp, Wallet } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/constants';
import { formatNumber, formatPrice } from '@/lib/utils';

interface DashboardData {
  stats: {
    albums: number;
    tracks: number;
    totalPlays: number;
    totalPurchases: number;
  };
  recentAlbums: {
    id: string;
    title: string;
    status: string;
    playCount: number;
    purchaseCount: number;
    price: string;
    createdAt: string;
  }[];
  artist: {
    name: string;
    slug: string;
    isVerified: boolean;
    balance: number;
  };
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Brouillon',
  SUBMITTED: 'En attente',
  VALIDATED: 'Validé',
  PUBLISHED: 'Publié',
  REJECTED: 'Rejeté',
  ARCHIVED: 'Archivé',
};

const statusVariants: Record<string, 'default' | 'warning' | 'success' | 'error' | 'secondary'> = {
  DRAFT: 'secondary',
  SUBMITTED: 'warning',
  VALIDATED: 'success',
  PUBLISHED: 'success',
  REJECTED: 'error',
  ARCHIVED: 'secondary',
};

export default function ArtistDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/artist/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="animate-pulse space-y-8">
          <div className="h-10 w-64 bg-surface-hover rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-surface-hover rounded-xl" />
            ))}
          </div>
          <div className="h-48 bg-surface-hover rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <p className="text-error">Erreur lors du chargement du dashboard</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{data.artist.name}</h1>
            {data.artist.isVerified && (
              <Badge variant="premium">Vérifié</Badge>
            )}
          </div>
          <p className="text-text-secondary">Tableau de bord artiste</p>
        </div>
        <Link href={ROUTES.ARTIST_CATALOG}>
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel album
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatsCard icon={Music} label="Albums" value={data.stats.albums} />
        <StatsCard icon={Play} label="Écoutes totales" value={formatNumber(data.stats.totalPlays)} />
        <StatsCard icon={ShoppingBag} label="Ventes" value={data.stats.totalPurchases} />
        <StatsCard icon={TrendingUp} label="Pistes" value={data.stats.tracks} />
        <StatsCard icon={Wallet} label="Gains" value={formatPrice(data.artist.balance, 'XOF')} />
      </div>

      {/* Recent Albums */}
      <div className="rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Albums récents</h2>
          <Link href={ROUTES.ARTIST_CATALOG}>
            <Button variant="ghost" size="sm">Voir tout</Button>
          </Link>
        </div>
        {data.recentAlbums.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-12 w-12 text-text-muted mx-auto mb-3 opacity-50" />
            <p className="text-text-secondary mb-4">Aucun album publié</p>
            <Link href={ROUTES.ARTIST_CATALOG}>
              <Button variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Créer un album
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-text-secondary border-b border-border">
                  <th className="pb-3 font-medium">Titre</th>
                  <th className="pb-3 font-medium">Statut</th>
                  <th className="pb-3 font-medium">Écoutes</th>
                  <th className="pb-3 font-medium">Ventes</th>
                  <th className="pb-3 font-medium">Prix</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAlbums.map((album) => (
                  <tr key={album.id} className="border-b border-border last:border-0">
                    <td className="py-3 text-sm font-medium">{album.title}</td>
                    <td className="py-3">
                      <Badge variant={statusVariants[album.status] || 'default'}>
                        {statusLabels[album.status] || album.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-text-secondary">{formatNumber(album.playCount)}</td>
                    <td className="py-3 text-sm text-text-secondary">{album.purchaseCount}</td>
                    <td className="py-3 text-sm text-accent">{formatPrice(Number(album.price))}</td>
                    <td className="py-3 text-sm text-text-muted">
                      {new Date(album.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

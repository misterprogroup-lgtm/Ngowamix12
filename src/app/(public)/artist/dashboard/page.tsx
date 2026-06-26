'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus, Music, Play, ShoppingBag, TrendingUp, Wallet,
  Sparkles, Radio, Gift, ArrowRight,
} from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/constants';
import { formatNumber, formatPrice } from '@/lib/utils';
import { AnimateOnView } from '@/components/ui/animate-on-view';

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
      <div className="animate-pulse space-y-8">
        <div className="h-10 w-64 bg-surface-hover rounded-sm" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-surface-hover rounded-xl" />
          ))}
        </div>
        <div className="h-48 bg-surface-hover rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <p className="text-error">Erreur lors du chargement du dashboard</p>
      </div>
    );
  }

  return (
    <div>
      <AnimateOnView>
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{data.artist.name}</h1>
              {data.artist.isVerified && (
                <Badge variant="success">Vérifié</Badge>
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
      </AnimateOnView>

      {!data.artist.isVerified && (
        <AnimateOnView delay={50}>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="font-medium text-amber-600 dark:text-amber-400">Compte non vérifié</p>
              <p className="text-sm text-text-secondary">Vous devez faire vérifier votre compte avant de pouvoir publier des musiques ou des concerts.</p>
            </div>
            <Link href={ROUTES.ARTIST_PROFILE}>
              <Button variant="outline" size="sm">Demander la vérification</Button>
            </Link>
          </div>
        </AnimateOnView>
      )}

      {/* Stats */}
      <AnimateOnView delay={100}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatsCard icon={Music} label="Albums" value={data.stats.albums} />
          <StatsCard icon={Play} label="Écoutes" value={formatNumber(data.stats.totalPlays)} />
          <StatsCard icon={ShoppingBag} label="Ventes" value={data.stats.totalPurchases} />
          <StatsCard icon={TrendingUp} label="Pistes" value={data.stats.tracks} />
          <StatsCard icon={Wallet} label="Gains" value={formatPrice(data.artist.balance, 'XOF')} />
        </div>
      </AnimateOnView>

      {/* Quick Actions */}
      <AnimateOnView delay={150}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Link
            href={ROUTES.ARTIST_CATALOG}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 hover:border-primary/30 transition-colors group"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Nouvel album</p>
              <p className="text-xs text-text-muted">Publier un titre</p>
            </div>
            <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-primary transition-colors shrink-0" />
          </Link>
          <Link
            href={ROUTES.ARTIST_LIVESTREAM}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 hover:border-primary/30 transition-colors group"
          >
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Radio className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Live stream</p>
              <p className="text-xs text-text-muted">Lancer un direct</p>
            </div>
            <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-accent transition-colors shrink-0" />
          </Link>
          <Link
            href={ROUTES.ARTIST_REFERRAL}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 hover:border-primary/30 transition-colors group"
          >
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
              <Gift className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Parrainage</p>
              <p className="text-xs text-text-muted">Inviter des amis</p>
            </div>
            <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-success transition-colors shrink-0" />
          </Link>
          <Link
            href={ROUTES.ARTIST_ROYALTIES}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 hover:border-primary/30 transition-colors group"
          >
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
              <Wallet className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Royalties</p>
              <p className="text-xs text-text-muted">Voir mes gains</p>
            </div>
            <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-warning transition-colors shrink-0" />
          </Link>
        </div>
      </AnimateOnView>

      {/* Recent Albums */}
      <AnimateOnView delay={200}>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.recentAlbums.map((album, i) => (
                <Link
                  key={album.id}
                  href={`/artist/catalog/${album.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-primary/30 hover:bg-surface-hover transition-all group"
                >
                  <div className="h-14 w-14 rounded-lg bg-surface-hover flex items-center justify-center shrink-0 overflow-hidden">
                    <Music className="h-6 w-6 text-text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{album.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={statusVariants[album.status] || 'default'} className="text-[10px] px-1.5 py-0">
                        {statusLabels[album.status] || album.status}
                      </Badge>
                      <span className="text-xs text-text-muted">
                        {formatNumber(album.playCount)} écoutes
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-primary transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </AnimateOnView>
    </div>
  );
}

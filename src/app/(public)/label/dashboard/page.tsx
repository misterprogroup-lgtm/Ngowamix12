'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Music, Play, ShoppingBag, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ArtistData {
  id: string;
  name: string;
  slug: string;
  avatar: string | null;
  isVerified: boolean;
  verificationStatus: string;
  balance: number;
  bio: string | null;
  genres: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    displayName: string | null;
    avatar: string | null;
    phone: string | null;
    phoneVerified: boolean;
  };
  albumCount: number;
  totalPlays: number;
  totalPurchases: number;
}

interface DashboardData {
  label: {
    id: string;
    name: string;
    slug: string;
  };
  artists: ArtistData[];
  totalArtists: number;
}

const verificationBadge: Record<string, { label: string; variant: 'warning' | 'success' | 'error' | 'secondary' }> = {
  NONE: { label: 'Non vérifié', variant: 'secondary' },
  PENDING: { label: 'En attente', variant: 'warning' },
  VERIFIED: { label: 'Vérifié', variant: 'success' },
  REJECTED: { label: 'Rejeté', variant: 'error' },
};

export default function LabelDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/label/artists')
      .then((res) => {
        if (!res.ok) throw new Error('Erreur');
        return res.json();
      })
      .then((data) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-surface-hover rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-surface-hover rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-surface-hover rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <p className="text-text-secondary">Erreur lors du chargement</p>
      </div>
    );
  }

  const totalPlays = data?.artists?.reduce((s, a) => s + (a.totalPlays || 0), 0) || 0;
  const totalPurchases = data?.artists?.reduce((s, a) => s + (a.totalPurchases || 0), 0) || 0;

  const stats = [
    { label: 'Artistes', value: data?.totalArtists || 0, icon: Users, color: 'text-primary' },
    { label: 'Total écoutes', value: totalPlays, icon: Play, color: 'text-success' },
    { label: 'Total ventes', value: totalPurchases, icon: ShoppingBag, color: 'text-accent' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{data.label.name}</h1>
          <p className="text-text-secondary mt-1">Gérez et supervisez vos artistes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="rounded-xl border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Artistes du label
          </h2>
        </div>

        {!data?.artists || data.artists.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucun artiste dans votre label</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.artists.map((artist) => (
              <div key={artist.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-surface-hover flex items-center justify-center overflow-hidden">
                    {artist.avatar ? (
                      <img src={artist.avatar} alt={artist.name} className="h-full w-full object-cover" />
                    ) : (
                      <Music className="h-5 w-5 text-text-muted" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{artist.name}</p>
                      <Badge variant={verificationBadge[artist.verificationStatus]?.variant || 'secondary'}>
                        {verificationBadge[artist.verificationStatus]?.label || artist.verificationStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-muted">
                      {artist.albumCount} album{artist.albumCount !== 1 ? 's' : ''} • {artist.totalPlays.toLocaleString()} écoutes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:ml-auto">
                  <Link href={`/artist/${artist.slug}`}>
                    <Button variant="ghost" size="sm">Voir</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

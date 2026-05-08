'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Check, X, RefreshCw, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import Image from 'next/image';

const statusTabs = [
  { id: 'PENDING', label: 'En attente' },
  { id: 'VERIFIED', label: 'Vérifiés' },
  { id: 'REJECTED', label: 'Rejetés' },
  { id: '', label: 'Tous' },
];

export default function AdminVerificationPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [status, setStatus] = useState('PENDING');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchArtists = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set('status', status);

    try {
      const res = await fetch(`/api/admin/artists?${params}`);
      const data = await res.json();
      setArtists(data.artists);
      setPendingCount(data.pendingCount || 0);
    } catch (error) {
      console.error('Fetch artists error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, [status]);

  const handleAction = async (artistId: string, action: string) => {
    setActionLoading(artistId + action);
    try {
      await fetch('/api/admin/artists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId, action }),
      });
      fetchArtists();
    } catch (error) {
      console.error('Action error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const statusVariant = (s: string): 'default' | 'warning' | 'success' | 'error' | 'secondary' => {
    const map: Record<string, 'default' | 'warning' | 'success' | 'error' | 'secondary'> = {
      NONE: 'secondary',
      PENDING: 'warning',
      VERIFIED: 'success',
      REJECTED: 'error',
    };
    return map[s] || 'default';
  };

  const statusLabel = (s: string): string => {
    const map: Record<string, string> = {
      NONE: 'Aucune demande',
      PENDING: 'En attente',
      VERIFIED: 'Vérifié',
      REJECTED: 'Rejeté',
    };
    return map[s] || s;
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Vérification des artistes
        </h1>
        {pendingCount > 0 && (
          <Badge variant="warning">
            {pendingCount} demande{pendingCount > 1 ? 's' : ''} en attente
          </Badge>
        )}
      </div>

      <Tabs tabs={statusTabs} activeTab={status} onTabChange={(id) => setStatus(id)} className="mb-6" />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-surface-hover rounded animate-pulse" />
          ))}
        </div>
      ) : artists.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-text-muted mx-auto mb-3 opacity-50" />
          <p className="text-text-secondary">Aucun artiste pour ce filtre</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface">
              <tr className="text-left text-sm text-text-secondary">
                <th className="p-3 font-medium">Artiste</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Albums</th>
                <th className="p-3 font-medium">Statut</th>
                <th className="p-3 font-medium">Demandée le</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {artists.map((artist) => (
                <tr key={artist.id} className="border-t border-border text-sm">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {artist.avatar ? (
                        <Image
                          src={artist.avatar}
                          alt={artist.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-xs">
                          {artist.name[0]}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{artist.name}</span>
                          {artist.isVerified && (
                            <Check className="h-3.5 w-3.5 text-primary fill-primary" />
                          )}
                        </div>
                        {artist.user?.displayName && (
                          <span className="text-xs text-text-muted">{artist.user.displayName}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-text-secondary">{artist.user?.email}</td>
                  <td className="p-3">{artist._count?.albums || 0}</td>
                  <td className="p-3">
                    <Badge variant={statusVariant(artist.verificationStatus)}>
                      {statusLabel(artist.verificationStatus)}
                    </Badge>
                  </td>
                  <td className="p-3 text-text-muted">
                    {artist.verificationRequestedAt
                      ? new Date(artist.verificationRequestedAt).toLocaleDateString('fr-FR')
                      : '—'}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Link href={`/artist/${artist.slug}`}>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <User className="h-4 w-4" />
                        </Button>
                      </Link>
                      {artist.verificationStatus === 'PENDING' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-success"
                            onClick={() => handleAction(artist.id, 'verify')}
                            isLoading={actionLoading === artist.id + 'verify'}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-error"
                            onClick={() => handleAction(artist.id, 'reject')}
                            isLoading={actionLoading === artist.id + 'reject'}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {(artist.verificationStatus === 'VERIFIED' || artist.verificationStatus === 'REJECTED') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-text-muted"
                          onClick={() => handleAction(artist.id, 'reset')}
                          isLoading={actionLoading === artist.id + 'reset'}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

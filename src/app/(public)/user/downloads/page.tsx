'use client';

import { useEffect, useState } from 'react';
import { Download, Music, FileAudio, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FREE_DOWNLOAD_QUOTA } from '@/lib/constants';
import { useAuthStore } from '@/store/auth-store';
import type { User } from '@/types';

interface DownloadRecord {
  id: string;
  downloadType: string;
  downloadedAt: string;
  album: {
    title: string;
    coverImage: string | null;
  } | null;
}

export default function DownloadsPage() {
  const { user, setUser } = useAuthStore();
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/user/status').then((r) => r.json()),
    ])
      .then(([statusData]) => {
        setUserData(statusData.user);
        if (statusData.user) {
          setUser(statusData.user as User);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [setUser]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 bg-surface-hover rounded" />
          <div className="h-32 bg-surface-hover rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Download className="h-6 w-6 text-success" />
        Mes téléchargements
      </h1>

      {userData?.isPremium ? (
        <div className="rounded-xl border border-border p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Téléchargements</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Forfait</span>
            <span className="text-sm font-bold text-success">Illimité</span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Téléchargements gratuits
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Utilisés ce mois</span>
              <span className="text-sm font-bold">
                {userData.downloadsUsedThisMonth || 0} / {FREE_DOWNLOAD_QUOTA}
              </span>
            </div>
            <div className="w-full bg-surface-hover rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, ((userData.downloadsUsedThisMonth || 0) / FREE_DOWNLOAD_QUOTA) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-text-muted">
              {FREE_DOWNLOAD_QUOTA - (userData.downloadsUsedThisMonth || 0)} téléchargements restants
            </p>
          </div>
        </div>
      )}

      {downloads.length === 0 ? (
        <div className="text-center py-16">
          <FileAudio className="h-16 w-16 text-text-muted mx-auto mb-4 opacity-50" />
          <h2 className="text-lg font-medium text-text-secondary mb-2">
            Aucun téléchargement
          </h2>
          <p className="text-text-muted">
            {userData?.isPremium
              ? 'Téléchargez des albums depuis votre bibliothèque ou depuis les pages album'
              : 'Achetez des albums ou passez Premium pour télécharger'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {downloads.map((dl) => (
            <div key={dl.id} className="flex items-center gap-4 rounded-lg border border-border px-4 py-3">
              <Download className="h-5 w-5 text-success shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {dl.album?.title || 'Contenu supprimé'}
                </p>
                <p className="text-xs text-text-muted">
                  {new Date(dl.downloadedAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <Badge variant={dl.downloadType === 'PURCHASE' ? 'success' : 'default'}>
                {dl.downloadType === 'PURCHASE' ? 'Achat' : 'Premium'}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

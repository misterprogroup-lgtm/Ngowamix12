'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Music, Check, X, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { formatPrice } from '@/lib/utils';

const statusTabs = [
  { id: 'ALL', label: 'Tous' },
  { id: 'SUBMITTED', label: 'En attente' },
  { id: 'PUBLISHED', label: 'Publiés' },
  { id: 'REJECTED', label: 'Rejetés' },
  { id: 'DRAFT', label: 'Brouillons' },
];

export default function AdminCatalogPage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  const fetchAlbums = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: '20' });
    if (status !== 'ALL') params.set('status', status);

    try {
      const res = await fetch(`/api/admin/catalog?${params}`);
      const data = await res.json();
      setAlbums(data.albums);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Fetch albums error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, [status, page]);

  const handleAction = async (albumId: string, action: string) => {
    try {
      await fetch('/api/admin/catalog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albumId, action }),
      });
      fetchAlbums();
    } catch (error) {
      console.error('Action error:', error);
    }
  };

  const handleDelete = async (albumId: string, title: string) => {
    if (!confirm(`Supprimer "${title}" ? Cette action est irréversible.`)) return;
    try {
      await fetch(`/api/admin/catalog?id=${albumId}`, { method: 'DELETE' });
      fetchAlbums();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const statusVariant = (s: string) => {
    const map: Record<string, 'default' | 'warning' | 'success' | 'error' | 'secondary'> = {
      DRAFT: 'secondary',
      SUBMITTED: 'warning',
      VALIDATED: 'success',
      PUBLISHED: 'success',
      REJECTED: 'error',
    };
    return map[s] || 'default';
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <Music className="h-6 w-6 text-primary" />
        Catalogue
      </h1>

      <Tabs tabs={statusTabs} activeTab={status} onTabChange={(id) => { setStatus(id); setPage(1); }} className="mb-6" />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-surface-hover rounded animate-pulse" />
          ))}
        </div>
      ) : albums.length === 0 ? (
        <div className="text-center py-12">
          <Music className="h-12 w-12 text-text-muted mx-auto mb-3 opacity-50" />
          <p className="text-text-secondary">Aucun album</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface">
                <tr className="text-left text-sm text-text-secondary">
                  <th className="p-3 font-medium">Album</th>
                  <th className="p-3 font-medium">Artiste</th>
                  <th className="p-3 font-medium">Pistes</th>
                  <th className="p-3 font-medium">Prix</th>
                  <th className="p-3 font-medium">Statut</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {albums.map((album) => (
                  <tr key={album.id} className="border-t border-border text-sm">
                    <td className="p-3 font-medium">{album.title}</td>
                    <td className="p-3">{album.artist.name}</td>
                    <td className="p-3">{album._count.tracks}</td>
                    <td className="p-3">{formatPrice(Number(album.price))}</td>
                    <td className="p-3">
                      <Badge variant={statusVariant(album.status)}>
                        {album.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-text-muted">
                      {new Date(album.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Link href={`/album/${album.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {album.status === 'SUBMITTED' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-success"
                              onClick={() => handleAction(album.id, 'validate')}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-error"
                              onClick={() => handleAction(album.id, 'reject')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-error"
                          onClick={() => handleDelete(album.id, album.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Précédent
              </Button>
              <span className="text-sm text-text-secondary">{page}/{pagination.pages}</span>
              <Button variant="secondary" size="sm" disabled={page === pagination.pages} onClick={() => setPage(page + 1)}>
                Suivant
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, ListMusic, Trash2, Loader2, ArrowLeft, Music, Users, User } from 'lucide-react';
import { usePlaylistStore } from '@/store/playlist-store';
import { useAuthStore } from '@/store/auth-store';
import { SafeImage } from '@/components/ui/safe-image';

export default function PlaylistsPage() {
  const { playlists, fetchPlaylists, createPlaylist, deletePlaylist } = usePlaylistStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchPlaylists().finally(() => setLoading(false));
  }, [fetchPlaylists]);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const playlist = await createPlaylist(newName.trim());
    setCreating(false);
    if (playlist) {
      setNewName('');
      setShowCreate(false);
    }
  }, [newName, createPlaylist]);

  const handleDelete = useCallback(async (id: string) => {
    setDeleting(id);
    await deletePlaylist(id);
    setDeleting(null);
  }, [deletePlaylist]);

  const isOwner = (playlist: any) => playlist.userId === user?.id;

  const ownerPlaylists = playlists.filter((p: any) => isOwner(p));
  const collabPlaylists = playlists.filter((p: any) => !isOwner(p));

  return (
    <div className="container mx-auto py-8 pb-24">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l&apos;accueil
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mes playlists</h1>
          <p className="text-sm text-text-secondary mt-1">
            {playlists.length} playlist{playlists.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvelle playlist
        </button>
      </div>

      {showCreate && (
        <div className="flex gap-2 mb-6 p-4 rounded-xl bg-surface border border-border">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom de la playlist..."
            className="flex-1 px-3 py-2 rounded-lg bg-surface-hover border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') setShowCreate(false);
            }}
          />
          <button
            onClick={handleCreate}
            disabled={!newName.trim() || creating}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Créer'}
          </button>
          <button
            onClick={() => { setShowCreate(false); setNewName(''); }}
            className="px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            Annuler
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
        </div>
      ) : !user ? (
        <div className="text-center py-20">
          <ListMusic className="h-12 w-12 mx-auto text-text-muted mb-4" />
          <p className="text-text-secondary">Connecte-toi pour créer et gérer tes playlists</p>
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-20">
          <ListMusic className="h-12 w-12 mx-auto text-text-muted mb-4" />
          <p className="text-text-secondary">Tu n&apos;as pas encore de playlist</p>
          <p className="text-sm text-text-muted mt-1">Clique sur &quot;Nouvelle playlist&quot; pour commencer</p>
        </div>
      ) : (
        <>
          {collabPlaylists.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-text-muted" />
                <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Collaborations</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {collabPlaylists.map((playlist: any) => (
                  <div
                    key={playlist.id}
                    className="group relative rounded-xl bg-surface border border-primary/20 hover:border-primary/40 transition-colors"
                  >
                    <Link
                      href={`/playlist/${playlist.id}`}
                      className="flex items-center gap-4 p-4"
                    >
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <ListMusic className="h-7 w-7 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-text-primary truncate">{playlist.name}</h3>
                        <p className="text-sm text-text-muted">
                          {'_count' in playlist ? (playlist as any)._count.tracks : playlist.trackCount ?? 0} titre{('_count' in playlist ? (playlist as any)._count.tracks : playlist.trackCount ?? 0) !== 1 ? 's' : ''}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <User className="h-3 w-3 text-text-muted" />
                          <span className="text-xs text-text-muted truncate">
                            {playlist.user?.displayName || 'Utilisateur'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">
              Mes playlists ({ownerPlaylists.length})
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ownerPlaylists.map((playlist: any) => (
              <div
                key={playlist.id}
                className="group relative rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors"
              >
                <Link
                  href={`/playlist/${playlist.id}`}
                  className="flex items-center gap-4 p-4"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-surface-hover">
                    <ListMusic className="h-7 w-7 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-text-primary truncate">{playlist.name}</h3>
                    <p className="text-sm text-text-muted">
                      {'_count' in playlist ? (playlist as any)._count.tracks : playlist.trackCount ?? 0} titre{('_count' in playlist ? (playlist as any)._count.tracks : playlist.trackCount ?? 0) !== 1 ? 's' : ''}
                    </p>
                    {playlist.collaborators && playlist.collaborators.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="h-3 w-3 text-text-muted" />
                        <span className="text-xs text-text-muted">{playlist.collaborators.length} collaborateur{playlist.collaborators.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => handleDelete(playlist.id)}
                  disabled={deleting === playlist.id}
                  className="absolute top-2 right-2 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-error/10 text-text-muted hover:text-error transition-all"
                >
                  {deleting === playlist.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

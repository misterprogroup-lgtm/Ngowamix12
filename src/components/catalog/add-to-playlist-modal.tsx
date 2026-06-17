'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Check, Music, Loader2, ListMusic } from 'lucide-react';
import { usePlaylistStore } from '@/store/playlist-store';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackId: string;
}

export function AddToPlaylistModal({ isOpen, onClose, trackId }: AddToPlaylistModalProps) {
  const { playlists, fetchPlaylists, createPlaylist, addTrackToPlaylist } = usePlaylistStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      fetchPlaylists().finally(() => setLoading(false));
    }
  }, [isOpen, user, fetchPlaylists]);

  const handleAdd = useCallback(async (playlistId: string) => {
    setAddingTo(playlistId);
    const ok = await addTrackToPlaylist(playlistId, trackId);
    setAddingTo(null);
    if (ok) {
      setSuccessId(playlistId);
      setTimeout(() => setSuccessId(null), 2000);
    }
  }, [addTrackToPlaylist, trackId]);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const playlist = await createPlaylist(newName.trim());
    setCreating(false);
    if (playlist) {
      setNewName('');
      const ok = await addTrackToPlaylist(playlist.id, trackId);
      if (ok) {
        setSuccessId(playlist.id);
        setTimeout(() => setSuccessId(null), 2000);
      }
    }
  }, [newName, createPlaylist, addTrackToPlaylist, trackId]);

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
        <div
          className="bg-surface rounded-xl shadow-xl p-6 mx-4 max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Ajouter à une playlist</h3>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-text-secondary text-center py-6">
            Connecte-toi pour créer et gérer tes playlists
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-surface rounded-xl shadow-xl p-6 mx-4 max-w-sm w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Ajouter à une playlist</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nouvelle playlist..."
            className="flex-1 px-3 py-2 rounded-lg bg-surface-hover border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
          />
          <button
            onClick={handleCreate}
            disabled={!newName.trim() || creating}
            className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Créer
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
            </div>
          ) : playlists.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">
              {user ? 'Aucune playlist. Crée-en une !' : ''}
            </p>
          ) : (
            playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => handleAdd(playlist.id)}
                disabled={addingTo === playlist.id}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  successId === playlist.id
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'text-text-primary hover:bg-surface-hover'
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-hover">
                  {successId === playlist.id ? (
                    <Check className="h-5 w-5 text-emerald-500" />
                  ) : addingTo === playlist.id ? (
                    <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
                  ) : (
                    <ListMusic className="h-5 w-5 text-text-muted" />
                  )}
                </div>
                <div className="min-w-0 text-left flex-1">
                  <p className="font-medium truncate">{playlist.name}</p>
                  <p className="text-xs text-text-muted">
                    {'_count' in playlist ? (playlist as any)._count.tracks : playlist.trackCount ?? 0} titre{(playlist as any)._count?.tracks !== 1 ? 's' : ''}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

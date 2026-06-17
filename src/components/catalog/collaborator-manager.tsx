'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, X, Loader2, Shield, Eye, Trash2, UserPlus } from 'lucide-react';
import { usePlaylistStore, type PlaylistCollaborator } from '@/store/playlist-store';
import { useAuthStore } from '@/store/auth-store';
import { SafeImage } from '@/components/ui/safe-image';
import { cn } from '@/lib/utils';

interface CollaboratorManagerProps {
  playlistId: string;
  isOwner: boolean;
}

export function CollaboratorManager({ playlistId, isOwner }: CollaboratorManagerProps) {
  const { getCollaborators, addCollaborator, updateCollaborator, removeCollaborator } = usePlaylistStore();
  const { user } = useAuthStore();
  const [collaborators, setCollaborators] = useState<PlaylistCollaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const loadCollaborators = async () => {
    setLoading(true);
    const data = await getCollaborators(playlistId);
    setCollaborators(data);
    setLoading(false);
  };

  useEffect(() => {
    if (playlistId) loadCollaborators();
  }, [playlistId]);

  const handleAdd = async () => {
    if (!email.trim()) return;
    setAdding(true);
    setError('');
    const result = await addCollaborator(playlistId, email.trim(), role);
    if (result) {
      setCollaborators((prev) => [...prev, result]);
      setEmail('');
      setShowAdd(false);
    } else {
      setError("Impossible d'ajouter ce collaborateur. Vérifie l'email.");
    }
    setAdding(false);
  };

  const handleRoleChange = async (collaboratorId: string, newRole: string) => {
    const ok = await updateCollaborator(playlistId, collaboratorId, newRole);
    if (ok) {
      setCollaborators((prev) =>
        prev.map((c) => (c.id === collaboratorId ? { ...c, role: newRole as 'EDITOR' | 'VIEWER' } : c))
      );
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    const ok = await removeCollaborator(playlistId, collaboratorId);
    if (ok) {
      setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-text-muted" />
          <span className="text-sm font-medium text-text-primary">Collaborateurs</span>
          {!loading && (
            <span className="text-xs text-text-muted">({collaborators.length})</span>
          )}
        </div>
        {isOwner && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Inviter
          </button>
        )}
      </div>

      {showAdd && (
        <div className="mb-4 p-3 rounded-xl bg-surface-hover border border-border">
          <div className="flex gap-2 mb-2">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="Email du collaborateur..."
              className="flex-1 px-3 py-2 rounded-lg bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            />
            <button
              onClick={handleAdd}
              disabled={!email.trim() || adding}
              className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors shrink-0"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </button>
            <button
              onClick={() => { setShowAdd(false); setEmail(''); setError(''); }}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-3">
            <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer">
              <input
                type="radio"
                name="collab-role"
                checked={role === 'EDITOR'}
                onChange={() => setRole('EDITOR')}
                className="text-primary"
              />
              <Shield className="h-3 w-3" />
              Éditeur (peut modifier)
            </label>
            <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer">
              <input
                type="radio"
                name="collab-role"
                checked={role === 'VIEWER'}
                onChange={() => setRole('VIEWER')}
                className="text-primary"
              />
              <Eye className="h-3 w-3" />
              Spectateur (lecture seule)
            </label>
          </div>
          {error && <p className="mt-2 text-xs text-error">{error}</p>}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
        </div>
      ) : collaborators.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-4">
          Aucun collaborateur. {isOwner ? 'Invite des personnes à collaborer !' : ''}
        </p>
      ) : (
        <div className="space-y-2">
          {collaborators.map((collab) => {
            const isSelf = collab.userId === user?.id;
            return (
              <div
                key={collab.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors group"
              >
                <div className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden bg-surface-hover">
                  {collab.user.avatar ? (
                    <SafeImage
                      src={collab.user.avatar}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-medium text-text-muted">
                      {collab.user.displayName?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {collab.user.displayName || collab.user.email}
                    {isSelf && <span className="text-xs text-text-muted ml-1">(toi)</span>}
                  </p>
                </div>
                {isOwner && !isSelf ? (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleRoleChange(
                        collab.id,
                        collab.role === 'EDITOR' ? 'VIEWER' : 'EDITOR'
                      )}
                      className={cn(
                        'p-1.5 rounded-lg text-xs transition-colors',
                        collab.role === 'EDITOR'
                          ? 'text-primary hover:bg-primary/10'
                          : 'text-text-muted hover:bg-surface-hover'
                      )}
                      title={collab.role === 'EDITOR' ? 'Rétrograder en spectateur' : 'Promouvoir en éditeur'}
                    >
                      {collab.role === 'EDITOR' ? (
                        <Shield className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleRemove(collab.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                      title="Retirer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className={cn(
                    'text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded',
                    collab.role === 'EDITOR'
                      ? 'text-primary bg-primary/10'
                      : 'text-text-muted bg-surface-hover'
                  )}>
                    {collab.role === 'EDITOR' ? 'Éditeur' : 'Spectateur'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

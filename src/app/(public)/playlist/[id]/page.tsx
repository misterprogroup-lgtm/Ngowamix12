'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { useParams } from 'next/navigation';
import { Play, Pause, Music, ArrowLeft, ListMusic, Trash2, Loader2, Plus, Search, X, Check, Share2, Link as LinkIcon, Globe, Lock } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { useAuthStore } from '@/store/auth-store';
import { formatDuration, cn } from '@/lib/utils';
import { useToast } from '@/components/feedback/toast';
import { CollaboratorManager } from '@/components/catalog/collaborator-manager';
import type { Playlist, Track } from '@/types';

export default function PlaylistDetailPage() {
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = `/playlist/${id}`;
    document.head.appendChild(link);
    return () => { link.remove(); };
  }, [id]);

  const { currentTrack, isPlaying, play, pause } = usePlayerStore();
  const { user } = useAuthStore();
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [removingTrack, setRemovingTrack] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [existingIds, setExistingIds] = useState<Set<string>>(new Set());
  const [showShareMenu, setShowShareMenu] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const { addToast } = useToast();

  const loadPlaylist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/playlists/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setPlaylist(data.playlist);
      setExistingIds(new Set(data.playlist.tracks.map((pt: any) => pt.trackId)));
    } catch {
      setPlaylist(null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadPlaylist();
  }, [loadPlaylist]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/tracks?search=${encodeURIComponent(query.trim())}&limit=10`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setSearchResults(data.tracks || []);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 300);
  }, []);

  const handleAddTrack = async (trackId: string) => {
    setAddingId(trackId);
    try {
      const res = await fetch(`/api/playlists/${id}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
      });
      if (res.ok) {
        setAddedId(trackId);
        setExistingIds((prev) => new Set(prev).add(trackId));
        setTimeout(() => setAddedId(null), 1500);
        await loadPlaylist();
      }
    } finally {
      setAddingId(null);
    }
  };

  const isTrackPlaying = (trackId: string) =>
    currentTrack?.id === trackId && isPlaying;

  const handlePlay = (track: Track) => {
    if (isTrackPlaying(track.id)) {
      pause();
    } else {
      const tracks = playlist?.tracks.map((pt: any) => pt.track) ?? [];
      const idx = tracks.findIndex((t: Track) => t.id === track.id);
      play(track, tracks, idx);
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    setRemovingTrack(trackId);
    try {
      await fetch(`/api/playlists/${id}/tracks`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
      });
      setExistingIds((prev) => {
        const next = new Set(prev);
        next.delete(trackId);
        return next;
      });
      await loadPlaylist();
    } finally {
      setRemovingTrack(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 pb-24 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="container mx-auto py-8 pb-24">
        <Link
          href="/playlists"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Mes playlists
        </Link>
        <div className="text-center py-20">
          <p className="text-text-secondary">Playlist non trouvée</p>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === playlist.userId;
  const canEdit = isOwner || playlist.collaborators?.some(
    (c: any) => c.userId === user?.id && c.role === 'EDITOR'
  );
  const tracks = playlist.tracks.map((pt: any) => pt.track);

  return (
    <div className="container mx-auto py-8 pb-24">
      <Link
        href="/playlists"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Mes playlists
      </Link>

      <div className="flex items-start gap-6 mb-8">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-surface-hover">
          <ListMusic className="h-10 w-10 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold truncate">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-sm text-text-secondary mt-1">{playlist.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-text-muted">
              {tracks.length} titre{tracks.length !== 1 ? 's' : ''}
            </p>
            {playlist.user && isOwner && (
              <span className="text-xs text-text-muted">· Créée par toi</span>
            )}
            {playlist.user && !isOwner && (
              <span className="text-xs text-text-muted">· Par {playlist.user.displayName || 'utilisateur'}</span>
            )}
          </div>
          {playlist.collaborators && playlist.collaborators.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex -space-x-2">
                {playlist.collaborators.slice(0, 5).map((collab: any) => (
                  <div
                    key={collab.id}
                    className="relative h-6 w-6 rounded-full border-2 border-surface overflow-hidden bg-surface-hover"
                  >
                    {collab.user.avatar ? (
                      <SafeImage src={collab.user.avatar} alt="" fill className="object-cover" sizes="24px" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[9px] font-medium text-text-muted">
                        {collab.user.displayName?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {playlist.collaborators.length > 5 && (
                <span className="text-xs text-text-muted ml-1">+{playlist.collaborators.length - 5}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canEdit && (
            <button
              onClick={() => { setShowSearch(!showSearch); setSearchQuery(''); setSearchResults([]); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              {showSearch ? (
                <><X className="h-4 w-4" /> Fermer</>
              ) : (
                <><Plus className="h-5 w-5" /> Ajouter</>
              )}
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-text-primary text-sm font-medium hover:bg-surface-hover transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Partager
            </button>
            {showShareMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-surface border border-border shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-border">
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Visibilité</p>
                </div>
                {isOwner && (
                  <button
                    onClick={async () => {
                      const newVisibility = !playlist!.isPublic;
                      try {
                        await fetch(`/api/playlists/${id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ isPublic: newVisibility }),
                        });
                        setPlaylist((prev: any) => prev ? { ...prev, isPublic: newVisibility } : prev);
                        addToast({
                          type: 'success',
                          title: newVisibility ? 'Playlist publique' : 'Playlist privée',
                          message: newVisibility
                            ? 'Tout le monde peut voir cette playlist'
                            : 'Seul toi peux voir cette playlist',
                        });
                      } catch {
                        addToast({ type: 'error', title: 'Erreur', message: 'Impossible de modifier la visibilité' });
                      }
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-surface-hover transition-colors text-left"
                  >
                    {playlist?.isPublic ? (
                      <Globe className="h-4 w-4 text-primary" />
                    ) : (
                      <Lock className="h-4 w-4 text-text-muted" />
                    )}
                    <div>
                      <p className="font-medium text-text-primary">
                        {playlist?.isPublic ? 'Publique' : 'Privée'}
                      </p>
                      <p className="text-xs text-text-muted">
                        {playlist?.isPublic
                          ? 'Visible par tout le monde'
                          : 'Visible par toi uniquement'}
                      </p>
                    </div>
                  </button>
                )}
                <div className="p-3 border-t border-border">
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Lien de partage</p>
                  <button
                    onClick={async () => {
                      if (!playlist?.isPublic) {
                        await fetch(`/api/playlists/${id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ isPublic: true }),
                        });
                        setPlaylist((prev: any) => prev ? { ...prev, isPublic: true } : prev);
                      }
                      const shareUrl = `${window.location.origin}/shared/playlist/${id}`;
                      await navigator.clipboard.writeText(shareUrl);
                      setShowShareMenu(false);
                      addToast({
                        type: 'success',
                        title: 'Lien copié !',
                        message: 'Le lien de partage a été copié dans le presse-papier',
                      });
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Copier le lien de partage
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          {showSearch && (
            <div className="mb-6 rounded-xl bg-surface border border-border overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="h-4 w-4 text-text-muted shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Rechercher une musique par titre..."
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                />
                {searching && <Loader2 className="h-4 w-4 animate-spin text-text-muted shrink-0" />}
                {searchQuery && !searching && (
                  <button onClick={() => handleSearch('')} className="text-text-muted hover:text-text-primary">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {searchResults.length > 0 && (
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map((track: any) => {
                    const alreadyIn = existingIds.has(track.id);
                    return (
                      <div
                        key={track.id}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-hover transition-colors"
                      >
                        <div className="relative h-9 w-9 shrink-0 rounded-md overflow-hidden bg-surface-hover">
                          {track.album?.coverImage ? (
                            <SafeImage src={track.album.coverImage} alt="" fill className="object-cover" sizes="36px" fallback={<div className="flex h-full items-center justify-center"><Music className="h-4 w-4 text-text-muted" /></div>} />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Music className="h-4 w-4 text-text-muted" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-text-primary truncate">{track.title}</p>
                          <p className="text-xs text-text-secondary truncate">{track.album?.artist?.name}</p>
                        </div>
                        <span className="text-xs text-text-muted">{formatDuration(track.duration)}</span>
                        {alreadyIn ? (
                          <span className="text-xs text-emerald-500 font-medium shrink-0">Ajouté</span>
                        ) : (
                          <button
                            onClick={() => handleAddTrack(track.id)}
                            disabled={addingId === track.id}
                            className="shrink-0 p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            {addingId === track.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : addedId === track.id ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {searchQuery && !searching && searchResults.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <Music className="h-8 w-8 mx-auto text-text-muted mb-2" />
                  <p className="text-sm text-text-muted">Aucun résultat pour &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
          )}

          {tracks.length === 0 && !showSearch ? (
            <div className="text-center py-16">
              <Music className="h-12 w-12 mx-auto text-text-muted mb-4" />
              <p className="text-text-secondary">Cette playlist est vide</p>
              {canEdit && (
                <button
                  onClick={() => { setShowSearch(true); }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter des titres
                </button>
              )}
            </div>
          ) : tracks.length > 0 && !showSearch ? (
            <div className="space-y-1">
              {playlist.tracks.map((pt: any, index: number) => (
                <div
                  key={pt.id}
                  className="group flex items-center gap-4 rounded-lg px-3 py-2 hover:bg-surface-hover transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center text-text-muted">
                    <span className="text-sm group-hover:hidden">{index + 1}</span>
                    <button
                      onClick={() => handlePlay(pt.track)}
                      className="hidden group-hover:flex items-center justify-center text-text-primary"
                    >
                      {isTrackPlaying(pt.track.id) ? (
                        <Pause className="h-4 w-4" fill="currentColor" />
                      ) : (
                        <Play className="h-4 w-4" fill="currentColor" />
                      )}
                    </button>
                  </div>
                  <div className="relative h-10 w-10 shrink-0 rounded-md overflow-hidden bg-surface-hover">
                    {pt.track.album?.coverImage ? (
                      <SafeImage
                        src={pt.track.album.coverImage}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                        fallback={<div className="flex h-full items-center justify-center"><Music className="h-5 w-5 text-text-muted" /></div>}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Music className="h-5 w-5 text-text-muted" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/track/${pt.track.id}`}
                      className={cn(
                        'text-sm font-medium truncate hover:text-primary transition-colors',
                        isTrackPlaying(pt.track.id) ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      {pt.track.title}
                    </Link>
                    <p className="text-xs text-text-secondary truncate">
                      {pt.track.album?.artist?.name}
                    </p>
                  </div>
                  <span className="text-xs text-text-muted">{formatDuration(pt.track.duration)}</span>
                  {canEdit && (
                    <button
                      onClick={() => handleRemoveTrack(pt.track.id)}
                      disabled={removingTrack === pt.track.id}
                      className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-error"
                    >
                      {removingTrack === pt.track.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl bg-surface border border-border p-4">
            <CollaboratorManager playlistId={id} isOwner={isOwner} />
          </div>
        </div>
      </div>
    </div>
  );
}

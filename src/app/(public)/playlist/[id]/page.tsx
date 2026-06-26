'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { useParams } from 'next/navigation';
import { Play, Pause, Music, ArrowLeft, ListMusic, Trash2, Loader2, Plus, Search, X, Check, Share2, Link as LinkIcon, Globe, Lock, Clock, Headphones } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { useAuthStore } from '@/store/auth-store';
import { AnimateOnView } from '@/components/ui/animate-on-view';
import { formatDuration, cn } from '@/lib/utils';
import { useToast } from '@/components/feedback/toast';
import { CollaboratorManager } from '@/components/catalog/collaborator-manager';
import type { Playlist, PlaylistTrackSummary, Track } from '@/types';

interface PlaylistDetail extends Playlist {
  collaborators?: Array<{ id: string; userId: string; role: string; user?: { displayName: string | null; avatar: string | null } }>;
  user?: { displayName: string | null };
}

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
  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addToast } = useToast();

  const loadPlaylist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/playlists/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setPlaylist(data.playlist);
      setExistingIds(new Set(data.playlist.tracks.map((pt: { trackId: string }) => pt.trackId)));
    } catch {
      setPlaylist(null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { loadPlaylist(); }, [loadPlaylist]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) searchInputRef.current.focus();
  }, [showSearch]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setSearchResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/tracks?search=${encodeURIComponent(query.trim())}&limit=10`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setSearchResults(data.tracks || []);
      } catch { setSearchResults([]); }
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
    } finally { setAddingId(null); }
  };

  const isTrackPlaying = (trackId: string) => currentTrack?.id === trackId && isPlaying;

  const handlePlay = (track: Track) => {
    if (isTrackPlaying(track.id)) { pause(); return; }
    const tracks = playlist?.tracks.map((pt) => pt.track) ?? [];
    const idx = tracks.findIndex((t: Track) => t.id === track.id);
    play(track, tracks, idx);
  };

  const handlePlayAll = () => {
    const tracks = playlist?.tracks.map((pt) => pt.track) ?? [];
    if (tracks.length > 0) play(tracks[0], tracks, 0);
  };

  const handleRemoveTrack = async (trackId: string) => {
    setRemovingTrack(trackId);
    try {
      await fetch(`/api/playlists/${id}/tracks`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
      });
      setExistingIds((prev) => { const next = new Set(prev); next.delete(trackId); return next; });
      await loadPlaylist();
    } finally { setRemovingTrack(null); }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <Link href="/playlists" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Mes playlists
        </Link>
        <div className="text-center py-20">
          <p className="text-text-secondary">Playlist non trouvée</p>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === playlist.userId;
  const canEdit = isOwner || playlist.collaborators?.some(
    (c) => c.userId === user?.id && c.role === 'EDITOR'
  );
  const tracks = playlist.tracks.map((pt) => pt.track);
  const totalDuration = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <Link
        href="/playlists"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-8"
      >
        ← Mes playlists
      </Link>

      <AnimateOnView className="flex flex-col md:flex-row gap-6 md:gap-8 mb-10">
        <div className="shrink-0 w-full max-w-xs mx-auto md:mx-0 md:w-56">
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/5 bg-surface-hover">
            {playlist.coverImage ? (
              <SafeImage src={playlist.coverImage} alt={playlist.name} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 224px" fallback={<div className="flex h-full items-center justify-center text-text-muted"><ListMusic className="h-16 w-16" /></div>} />
            ) : (
              <div className="flex h-full items-center justify-center bg-linear-to-br from-primary/20 to-accent/20 text-primary">
                <ListMusic className="h-16 w-16" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            {playlist.isPublic ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <Globe className="h-3 w-3" /> Publique
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-text-muted bg-surface-hover px-2 py-0.5 rounded-sm">
                <Lock className="h-3 w-3" /> Privée
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold truncate">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-sm text-text-secondary mt-1 line-clamp-2">{playlist.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-text-muted">
            <span>{tracks.length} titre{tracks.length !== 1 ? 's' : ''}</span>
            {totalDuration > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(totalDuration)}
              </span>
            )}
            {playlist.user && !isOwner && (
              <span>Par {playlist.user.displayName || 'utilisateur'}</span>
            )}
            {playlist.user && isOwner && <span>Créée par toi</span>}
          </div>
          {playlist.collaborators && playlist.collaborators.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex -space-x-2">
                {playlist.collaborators.slice(0, 5).map((collab) => (
                  <div key={collab.id} className="relative h-6 w-6 rounded-full border-2 border-surface overflow-hidden bg-surface-hover">
                    {collab.user?.avatar ? (
                      <SafeImage src={collab.user.avatar} alt="" fill className="object-cover" sizes="24px" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[9px] font-medium text-text-muted">
                        {collab.user?.displayName?.[0]?.toUpperCase() || '?'}
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
          <div className="flex flex-wrap items-center gap-3 mt-5">
            {tracks.length > 0 && (
              <button onClick={handlePlayAll} className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary/25">
                <Play className="h-5 w-5" fill="currentColor" />
                Tout écouter
              </button>
            )}
            {canEdit && (
              <button onClick={() => { setShowSearch(!showSearch); setSearchQuery(''); setSearchResults([]); }} className={cn("flex items-center gap-2 px-4 py-3 rounded-full border text-sm font-medium transition-all duration-200", showSearch ? "border-primary text-primary bg-primary/10" : "border-border text-text-secondary hover:text-text-primary hover:bg-surface")}>
                {showSearch ? <><X className="h-4 w-4" /> Fermer</> : <><Plus className="h-5 w-5" /> Ajouter</>}
              </button>
            )}
            <div className="relative">
              <button onClick={() => setShowShareMenu(!showShareMenu)} className="flex items-center gap-2 px-4 py-3 rounded-full border border-border text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-all duration-200">
                <Share2 className="h-4 w-4" /> Partager
              </button>
              {showShareMenu && (
                <div className="absolute left-0 md:right-0 md:left-auto top-full mt-2 w-64 rounded-xl bg-surface border border-border shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-border">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Visibilité</p>
                  </div>
                  {isOwner && (
                    <button onClick={async () => {
                      const newVisibility = !playlist!.isPublic;
                      try {
                        await fetch(`/api/playlists/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPublic: newVisibility }) });
                        setPlaylist((prev) => prev ? { ...prev, isPublic: newVisibility } : prev);
                        addToast({ type: 'success', title: newVisibility ? 'Playlist publique' : 'Playlist privée', message: newVisibility ? 'Tout le monde peut voir cette playlist' : 'Seul toi peux voir cette playlist' });
                      } catch { addToast({ type: 'error', title: 'Erreur', message: 'Impossible de modifier la visibilité' }); }
                    }} className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-surface-hover transition-colors text-left">
                      {playlist?.isPublic ? <Globe className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-text-muted" />}
                      <div>
                        <p className="font-medium text-text-primary">{playlist?.isPublic ? 'Publique' : 'Privée'}</p>
                        <p className="text-xs text-text-muted">{playlist?.isPublic ? 'Visible par tout le monde' : 'Visible par toi uniquement'}</p>
                      </div>
                    </button>
                  )}
                  <div className="p-3 border-t border-border">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Lien de partage</p>
                    <button onClick={async () => {
                      if (!playlist?.isPublic) {
                        await fetch(`/api/playlists/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPublic: true }) });
                        setPlaylist((prev) => prev ? { ...prev, isPublic: true } : prev);
                      }
                      const shareUrl = `${window.location.origin}/shared/playlist/${id}`;
                      await navigator.clipboard.writeText(shareUrl);
                      setShowShareMenu(false);
                      addToast({ type: 'success', title: 'Lien copié !', message: 'Le lien de partage a été copié dans le presse-papier' });
                    }} className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                      <LinkIcon className="h-4 w-4" /> Copier le lien de partage
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AnimateOnView>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {showSearch && (
            <AnimateOnView className="mb-6 rounded-xl bg-surface border border-border overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="h-4 w-4 text-text-muted shrink-0" />
                <input ref={searchInputRef} type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder="Rechercher une musique par titre..." className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden" />
                {searching && <Loader2 className="h-4 w-4 animate-spin text-text-muted shrink-0" />}
                {searchQuery && !searching && <button onClick={() => handleSearch('')} className="text-text-muted hover:text-text-primary"><X className="h-4 w-4" /></button>}
              </div>
              {searchResults.length > 0 && (
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map((track) => {
                    const alreadyIn = existingIds.has(track.id);
                    return (
                      <div key={track.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-hover transition-colors">
                        <div className="relative h-9 w-9 shrink-0 rounded-md overflow-hidden bg-surface-hover">
                          {track.album?.coverImage ? (
                            <SafeImage src={track.album.coverImage} alt="" fill className="object-cover" sizes="36px" fallback={<div className="flex h-full items-center justify-center"><Music className="h-4 w-4 text-text-muted" /></div>} />
                          ) : (
                            <div className="flex h-full items-center justify-center"><Music className="h-4 w-4 text-text-muted" /></div>
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
                          <button onClick={() => handleAddTrack(track.id)} disabled={addingId === track.id} className="shrink-0 p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                            {addingId === track.id ? <Loader2 className="h-4 w-4 animate-spin" /> : addedId === track.id ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
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
            </AnimateOnView>
          )}

          {tracks.length === 0 && !showSearch ? (
            <div className="text-center py-16">
              <ListMusic className="h-12 w-12 mx-auto text-text-muted mb-4" />
              <p className="text-text-secondary">Cette playlist est vide</p>
              {canEdit && (
                <button onClick={() => setShowSearch(true)} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all duration-200 shadow-lg shadow-primary/25">
                  <Plus className="h-4 w-4" /> Ajouter des titres
                </button>
              )}
            </div>
          ) : tracks.length > 0 ? (
            <div className="space-y-1">
              {playlist.tracks.map((pt, index) => {
                const isCurrent = isTrackPlaying(pt.track.id);
                return (
                  <AnimateOnView key={pt.id} delay={Math.min(index * 30, 300)} animation="fadeIn">
                    <div className={cn("group flex items-center gap-4 rounded-lg px-3 py-2 hover:bg-surface-hover transition-colors", isCurrent && "bg-primary/10")}>
                      <button onClick={() => handlePlay(pt.track)} className="flex h-8 w-8 items-center justify-center text-text-muted shrink-0">
                        <span className={cn("text-sm", isCurrent && "text-primary", "group-hover:hidden")}>{index + 1}</span>
                        <span className="hidden group-hover:flex items-center justify-center text-text-primary">
                          {isCurrent && isPlaying ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4" fill="currentColor" />}
                        </span>
                      </button>
                      <div className="relative h-10 w-10 shrink-0 rounded-md overflow-hidden bg-surface-hover">
                        {pt.track.album?.coverImage ? (
                          <SafeImage src={pt.track.album.coverImage} alt="" fill className="object-cover" sizes="40px" fallback={<div className="flex h-full items-center justify-center"><Music className="h-5 w-5 text-text-muted" /></div>} />
                        ) : (
                          <div className="flex h-full items-center justify-center"><Music className="h-5 w-5 text-text-muted" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/track/${pt.track.id}`} className={cn("text-sm font-medium truncate block hover:text-primary transition-colors", isCurrent ? "text-primary" : "text-text-primary")}>
                          {pt.track.title}
                        </Link>
                        <p className="text-xs text-text-secondary truncate">
                          <Link href={`/artist/${pt.track.album?.artist?.slug}`} className="hover:text-primary transition-colors">
                            {pt.track.album?.artist?.name}
                          </Link>
                        </p>
                      </div>
                      <span className="text-xs text-text-muted tabular-nums">{formatDuration(pt.track.duration)}</span>
                      {canEdit && (
                        <button onClick={() => handleRemoveTrack(pt.track.id)} disabled={removingTrack === pt.track.id} className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-error">
                          {removingTrack === pt.track.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </AnimateOnView>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-1">
          <AnimateOnView delay={100}>
            <div className="rounded-xl bg-surface border border-border p-4">
              <CollaboratorManager playlistId={id} isOwner={isOwner} />
            </div>
          </AnimateOnView>
        </div>
      </div>
    </div>
  );
}

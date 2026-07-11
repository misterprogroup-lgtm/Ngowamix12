'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Music, ListMusic, Loader2, ArrowLeft } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { MusicList } from '@/components/track/music-list';
import type { Playlist, Track } from '@/types';

export default function SharedPlaylistPage() {
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
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/playlists/${id}`);
        if (!res.ok) {
          if (res.status === 404) setError('Playlist non trouvée');
          else setError('Erreur lors du chargement');
          return;
        }
        const data = await res.json();
        setPlaylist(data.playlist);
      } catch {
        setError('Erreur de chargement');
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const isTrackPlaying = (trackId: string) =>
    currentTrack?.id === trackId && isPlaying;

  const handlePlay = (track: Track) => {
    if (isTrackPlaying(track.id)) {
      pause();
    } else {
      const tracks = playlist?.tracks.map((pt) => pt.track) ?? [];
      const idx = tracks.findIndex((t) => t.id === track.id);
      play(track, tracks, idx);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <Music className="h-16 w-16 text-text-muted mb-4" />
        <h1 className="text-xl font-bold text-text-primary mb-2">
          {error || 'Playlist introuvable'}
        </h1>
        <p className="text-sm text-text-secondary mb-6 text-center">
          Cette playlist n&apos;existe pas ou a été rendue privée par son créateur.
        </p>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  const tracks = playlist.tracks.map((pt) => pt.track);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="flex items-center gap-6 mb-8">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-surface-hover">
            <ListMusic className="h-10 w-10 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold text-text-primary truncate">{playlist.name}</h1>
            <p className="text-sm text-text-muted mt-1">
              {tracks.length} titre{tracks.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {tracks.length === 0 ? (
          <div className="text-center py-16">
            <Music className="h-12 w-12 mx-auto text-text-muted mb-4" />
            <p className="text-text-secondary">Cette playlist est vide</p>
          </div>
        ) : (
          <MusicList
            items={playlist.tracks.map((pt) => ({
              id: pt.track.id,
              title: pt.track.title,
              artist: pt.track.album?.artist?.name || 'Artiste inconnu',
              cover: pt.track.album?.coverImage || null,
              duration: pt.track.duration,
              artistSlug: pt.track.album?.artist?.slug,
            }))}
            currentId={currentTrack?.id}
            isPlaying={isPlaying}
            onPlay={(trackId) => {
              const pt = playlist.tracks.find((t) => t.track.id === trackId);
              if (pt) handlePlay(pt.track);
            }}
          />
        )}

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à Ngowamix
          </Link>
        </div>
      </div>
    </div>
  );
}

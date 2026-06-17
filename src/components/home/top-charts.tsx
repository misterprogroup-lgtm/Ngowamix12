'use client';

import { useState, useEffect } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import Link from 'next/link';
import { Play, Pause, Music, Clock, TrendingUp, Headphones, ArrowRight } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { formatDuration, formatNumber } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { HorizontalScroll } from '@/components/ui/horizontal-scroll';
import type { Track } from '@/types';

interface ChartTrack {
  id: string;
  title: string;
  duration: number;
  playCount: number;
  audioFile: string;
  album: {
    title: string;
    slug: string;
    coverImage: string | null;
    artist: { name: string; slug: string };
  };
}

interface TopAlbum {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  playCount: number;
  artist: { name: string; slug: string };
}

export function TopCharts() {
  const [tracks, setTracks] = useState<ChartTrack[]>([]);
  const [topAlbum, setTopAlbum] = useState<TopAlbum | null>(null);
  const [loading, setLoading] = useState(true);
  const { play, togglePlay, currentTrack, isPlaying } = usePlayerStore();

  useEffect(() => {
    Promise.all([
      fetch('/api/tracks?limit=5&sort=plays').then((r) => r.json()),
      fetch('/api/albums?limit=1&sort=plays&period=month').then((r) => r.json()),
    ])
      .then(([tracksData, albumsData]) => {
        setTracks(tracksData.tracks || []);
        const albums = albumsData.albums || [];
        if (albums.length > 0) {
          setTopAlbum(albums[0]);
        } else {
          setTopAlbum(null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handlePlay = (track: ChartTrack) => {
    const trackData: Track = {
      id: track.id,
      title: track.title,
      slug: '',
      trackNumber: 0,
      duration: track.duration,
      audioFile: track.audioFile,
      isExplicit: false,
      isPremiumOnly: false,
      playCount: track.playCount,
      album: {
        id: '',
        title: track.album.title,
        coverImage: track.album.coverImage,
        artist: {
          id: '',
          name: track.album.artist.name,
          slug: track.album.artist.slug,
          avatar: null,
        },
      },
    };

    if (currentTrack?.id === track.id && isPlaying) {
      togglePlay();
    } else {
      play(
        trackData,
        tracks.map((t) => ({
          id: t.id,
          title: t.title,
          slug: '',
          trackNumber: 0,
          duration: t.duration,
          audioFile: t.audioFile,
          isExplicit: false,
          isPremiumOnly: false,
          playCount: t.playCount,
          album: {
            id: '',
            title: t.album.title,
            coverImage: t.album.coverImage,
            artist: {
              id: '',
              name: t.album.artist.name,
              slug: t.album.artist.slug,
              avatar: null,
            },
          },
        })),
        tracks.findIndex((t) => t.id === track.id)
      );
    }
  };

  return (
    <section className="bg-surface/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Classements
            </h2>
            <p className="text-text-secondary mt-1">
              Les morceaux les plus écoutés du moment
            </p>
          </div>
          <Link href="/explore" className="text-sm font-medium text-primary hover:text-primary-hover hidden md:flex items-center gap-1 shrink-0">
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <>
            <div className="block md:hidden space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <Skeleton className="w-6 h-4" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
            <div className="hidden md:grid md:grid-cols-5 gap-6">
              <div className="md:col-span-2 space-y-4">
                <Skeleton className="aspect-square rounded-2xl w-full max-w-sm mx-auto" />
                <div className="space-y-2 text-center">
                  <Skeleton className="h-5 w-40 mx-auto" />
                  <Skeleton className="h-4 w-28 mx-auto" />
                </div>
              </div>
              <div className="md:col-span-3 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-3">
                    <Skeleton className="w-6 h-4" />
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : tracks.length === 0 ? null : (
          <>
            {/* Mobile: standalone scrollable list (no grid) */}
            <div className="block md:hidden">
              <HorizontalScroll withPadding={false}>
                {tracks.map((track, index) => {
                  const isCurrentTrack = currentTrack?.id === track.id;
                  return (
                    <button
                      key={track.id}
                      onClick={() => handlePlay(track)}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-surface-hover transition-colors w-[300px] text-left group shrink-0 snap-start bg-surface rounded-lg"
                    >
                      <span className="relative w-6 text-center shrink-0">
                        {isCurrentTrack && isPlaying ? (
                          <Pause className="h-4 w-4 text-primary mx-auto" fill="currentColor" />
                        ) : isCurrentTrack ? (
                          <Play className="h-4 w-4 text-primary mx-auto" fill="currentColor" />
                        ) : (
                          <span className="text-sm text-text-muted font-medium group-hover:hidden">
                            {index + 1}
                          </span>
                        )}
                        <span className="hidden group-hover:inline text-primary">
                          <Play className="h-4 w-4 mx-auto" fill="currentColor" />
                        </span>
                      </span>
                      <div className="relative h-10 w-10 rounded-md bg-surface-hover overflow-hidden shrink-0">
                        {track.album.coverImage ? (
                          <SafeImage src={track.album.coverImage} alt="" fill sizes="40px" className="object-cover" fallback={<div className="flex h-full items-center justify-center"><Music className="h-4 w-4 text-text-muted" /></div>} />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Music className="h-4 w-4 text-text-muted" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${isCurrentTrack ? 'text-primary' : ''}`}>
                          {track.title}
                        </p>
                        <p className="text-xs text-text-secondary truncate">
                          {track.album.artist.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted shrink-0">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(track.duration)}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {formatNumber(track.playCount)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </HorizontalScroll>
            </div>

            {/* Desktop: grid with featured album */}
            <div className="hidden md:grid md:grid-cols-5 gap-8 items-start">
              {topAlbum && (
                <div className="md:col-span-2">
                  <Link
                    href={`/album/${topAlbum.id}`}
                    className="group block"
                  >
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 p-8 max-w-sm mx-auto ring-1 ring-primary/10">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5" />
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="relative aspect-square w-full max-w-[280px] rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/20 mb-5">
                          {topAlbum.coverImage ? (
                            <SafeImage
                              src={topAlbum.coverImage}
                              alt={topAlbum.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, 220px"
                              fallback={<div className="flex h-full items-center justify-center"><Music className="h-16 w-16 text-text-muted" /></div>}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Music className="h-16 w-16 text-text-muted" />
                            </div>
                          )}
                        </div>
                        <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 z-20">
                          <TrendingUp className="h-3 w-3" />
                          #1 du mois
                        </div>
                        <p className="font-bold text-text-primary text-lg text-center truncate max-w-full">
                          {topAlbum.title}
                        </p>
                        <p className="text-sm text-text-secondary text-center truncate max-w-full">
                          {topAlbum.artist.name}
                        </p>
                        <p className="text-xs text-text-muted flex items-center gap-1 mt-2">
                          <Headphones className="h-3 w-3" />
                          {formatNumber(topAlbum.playCount)} écoutes ce mois-ci
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              <div className={topAlbum ? 'md:col-span-3' : 'md:col-span-5'}>
                <div className="rounded-xl border border-border overflow-hidden">
                  {tracks.map((track, index) => {
                    const isCurrentTrack = currentTrack?.id === track.id;
                    return (
                      <button
                        key={track.id}
                        onClick={() => handlePlay(track)}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-surface-hover transition-colors border-b border-border last:border-0 w-full text-left group"
                      >
                        <span className="relative w-6 text-center shrink-0">
                          {isCurrentTrack && isPlaying ? (
                            <Pause className="h-4 w-4 text-primary mx-auto" fill="currentColor" />
                          ) : isCurrentTrack ? (
                            <Play className="h-4 w-4 text-primary mx-auto" fill="currentColor" />
                          ) : (
                            <span className="text-sm text-text-muted font-medium group-hover:hidden">
                              {index + 1}
                            </span>
                          )}
                          <span className="hidden group-hover:inline text-primary">
                            <Play className="h-4 w-4 mx-auto" fill="currentColor" />
                          </span>
                        </span>
                        <div className="relative h-10 w-10 rounded-md bg-surface-hover overflow-hidden shrink-0">
                          {track.album.coverImage ? (
                            <SafeImage src={track.album.coverImage} alt="" fill sizes="40px" className="object-cover" fallback={<div className="flex h-full items-center justify-center"><Music className="h-4 w-4 text-text-muted" /></div>} />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Music className="h-4 w-4 text-text-muted" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium truncate ${isCurrentTrack ? 'text-primary' : ''}`}>
                            {track.title}
                          </p>
                          <p className="text-xs text-text-secondary truncate">
                            {track.album.artist.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-text-muted shrink-0">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(track.duration)}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {formatNumber(track.playCount)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

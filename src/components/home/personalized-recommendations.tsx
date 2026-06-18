'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Pause, Music, Loader2 } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import { usePlayerStore } from '@/store/player-store';
import { useAuthStore } from '@/store/auth-store';
import { HorizontalScroll } from '@/components/ui/horizontal-scroll';
import { formatDuration } from '@/lib/utils';

interface TrackRec {
  id: string;
  title: string;
  duration: number;
  reason: string;
  album: {
    id: string;
    title: string;
    coverImage: string | null;
    artist: { id: string; name: string; slug: string };
  };
}

interface ArtistRec {
  id: string;
  name: string;
  slug: string;
  avatar: string | null;
  reason: string;
}

export function PersonalizedRecommendations() {
  const { user } = useAuthStore();
  const [tracks, setTracks] = useState<TrackRec[]>([]);
  const [artists, setArtists] = useState<ArtistRec[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [trackRes, artistRes] = await Promise.all([
          fetch('/api/recommendations?type=tracks&limit=15'),
          fetch('/api/recommendations?type=artists&limit=8'),
        ]);
        const trackData = await trackRes.json();
        const artistData = await artistRes.json();
        setTracks(trackData.tracks || []);
        setArtists(artistData.artists || []);
      } catch {
        setTracks([]);
        setArtists([]);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return null;
  if (tracks.length === 0 && artists.length === 0) return null;

  return (
    <div className="space-y-8">
      {tracks.length > 0 && <RecommendedTracks tracks={tracks} />}
      {artists.length > 0 && <RecommendedArtists artists={artists} />}
    </div>
  );
}

function RecommendedTracks({ tracks }: { tracks: TrackRec[] }) {
  const { currentTrack, isPlaying, play, pause } = usePlayerStore();

  const isTrackPlaying = (id: string) => currentTrack?.id === id && isPlaying;

  const handlePlay = (track: TrackRec) => {
    if (isTrackPlaying(track.id)) {
      pause();
    } else {
      play(track as any, tracks as any, tracks.indexOf(track));
    }
  };

  return (
    <HorizontalScroll title="Recommandé pour toi" subtitle="Suggestions personnalisées">
      {tracks.map((track) => (
        <div key={track.id} className="group w-48 snap-start shrink-0">
          <div className="relative mb-3">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-hover">
              {track.album?.coverImage ? (
                <SafeImage
                  src={track.album.coverImage}
                  alt={track.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="192px"
                  fallback={
                    <div className="flex h-full items-center justify-center">
                      <Music className="h-8 w-8 text-text-muted" />
                    </div>
                  }
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Music className="h-8 w-8 text-text-muted" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <button
                onClick={() => handlePlay(track)}
                className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-primary text-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all hover:bg-primary-hover"
              >
                {isTrackPlaying(track.id) ? (
                  <Pause className="h-5 w-5" fill="currentColor" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                )}
              </button>
            </div>
          </div>
          <div className="px-1">
            <Link href={`/track/${track.id}`} className="block">
              <p className="text-sm font-medium text-text-primary truncate hover:text-primary transition-colors">
                {track.title}
              </p>
            </Link>
            <Link href={`/artist/${track.album?.artist?.slug || '#'}`} className="block">
              <p className="text-xs text-text-secondary truncate hover:text-primary transition-colors">
                {track.album?.artist?.name}
              </p>
            </Link>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-primary/70 font-medium">{track.reason}</span>
              <span className="text-[10px] text-text-muted">{formatDuration(track.duration)}</span>
            </div>
          </div>
        </div>
      ))}
    </HorizontalScroll>
  );
}

function RecommendedArtists({ artists }: { artists: ArtistRec[] }) {
  return (
    <HorizontalScroll title="Artistes suggérés" subtitle="Basé sur tes goûts">
      {artists.map((artist) => (
        <Link
          key={artist.id}
          href={`/artist/${artist.slug}`}
          className="group w-36 snap-start shrink-0"
        >
          <div className="relative mb-3">
            <div className="relative aspect-square rounded-full overflow-hidden bg-surface-hover mx-auto w-32">
              {artist.avatar ? (
                <SafeImage
                  src={artist.avatar}
                  alt={artist.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="128px"
                  fallback={
                    <div className="flex h-full items-center justify-center">
                      <Music className="h-8 w-8 text-text-muted" />
                    </div>
                  }
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Music className="h-8 w-8 text-text-muted" />
                </div>
              )}
            </div>
          </div>
          <p className="text-sm font-medium text-text-primary text-center truncate hover:text-primary transition-colors">
            {artist.name}
          </p>
          <p className="text-[10px] text-primary/70 font-medium text-center">{artist.reason}</p>
        </Link>
      ))}
    </HorizontalScroll>
  );
}

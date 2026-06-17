'use client';

import { Play, Pause, Music, Clock } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface Episode {
  id: string;
  title: string;
  description: string | null;
  audioFile: string;
  duration: number;
  episodeNumber: number;
}

interface EpisodeListProps {
  episodes: Episode[];
  isAdmin?: boolean;
  onDelete?: (episodeId: string) => void;
}

export function EpisodeList({ episodes, isAdmin, onDelete }: EpisodeListProps) {
  if (episodes.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Aucun épisode pour le moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {episodes.map((episode) => (
        <div
          key={episode.id}
          className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border bg-surface/50 hover:bg-surface-hover transition-colors group"
        >
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Play className="h-4 w-4 text-primary ml-0.5" fill="currentColor" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary truncate">
              {episode.episodeNumber}. {episode.title}
            </p>
            {episode.description && (
              <p className="text-xs text-text-muted truncate">
                {episode.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-text-muted shrink-0">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(episode.duration)}
            </span>
            {isAdmin && onDelete && (
              <button
                onClick={() => onDelete(episode.id)}
                className="text-red-500 hover:text-red-400 transition-colors"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

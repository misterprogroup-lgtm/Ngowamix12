import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { Track } from '../types';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: (tracks: Track[]) => void;
  prevTrack: (tracks: Track[]) => void;
}

const PlayerContext = createContext<PlayerContextType>({} as PlayerContextType);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  }, []);

  const pauseTrack = useCallback(() => setIsPlaying(false), []);
  const resumeTrack = useCallback(() => setIsPlaying(true), []);

  const nextTrack = useCallback((tracks: Track[]) => {
    if (!currentTrack || tracks.length === 0) return;
    const idx = tracks.findIndex((t) => t.id === currentTrack.id);
    if (idx < tracks.length - 1) {
      setCurrentTrack(tracks[idx + 1]);
    }
  }, [currentTrack]);

  const prevTrack = useCallback((tracks: Track[]) => {
    if (!currentTrack || tracks.length === 0) return;
    const idx = tracks.findIndex((t) => t.id === currentTrack.id);
    if (idx > 0) {
      setCurrentTrack(tracks[idx - 1]);
    }
  }, [currentTrack]);

  return (
    <PlayerContext.Provider value={{ currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack, nextTrack, prevTrack }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);

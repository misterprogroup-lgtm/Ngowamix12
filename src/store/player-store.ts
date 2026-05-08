import { create } from 'zustand';
import type { Track, PlayerState } from '@/types';

interface PlayerStore extends PlayerState {
  audioElement: HTMLAudioElement | null;
  setAudioElement: (audio: HTMLAudioElement | null) => void;
  setTrack: (track: Track, queue?: Track[], index?: number) => void;
  play: (track: Track, queue?: Track[], index?: number) => void;
  pause: () => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  next: () => void;
  prev: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setQueue: (queue: Track[]) => void;
  clear: () => void;
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 0.7,
  queue: [],
  queueIndex: 0,
  repeat: false,
  shuffle: false,
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  ...initialState,
  audioElement: null,

  setAudioElement: (audio) => set({ audioElement: audio }),

  setTrack: (track, queue, index) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.src = track.audioFile;
      audioElement.play();
    }
    set({
      currentTrack: track,
      isPlaying: true,
      progress: 0,
      queue: queue || get().queue,
      queueIndex: index ?? 0,
    });
  },

  togglePlay: () => {
    const { audioElement, isPlaying } = get();
    if (audioElement) {
      isPlaying ? audioElement.pause() : audioElement.play();
      set({ isPlaying: !isPlaying });
    }
  },

  play: (track, queue, index) => {
    set({
      currentTrack: track,
      isPlaying: true,
      progress: 0,
      queue: queue || get().queue,
      queueIndex: index ?? 0,
    });
  },

  pause: () => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.pause();
      set({ isPlaying: false });
    }
  },

  setPlaying: (playing) => set({ isPlaying: playing }),

  setProgress: (progress) => set({ progress }),

  setDuration: (duration) => set({ duration }),

  setVolume: (volume) => {
    const { audioElement } = get();
    if (audioElement) audioElement.volume = volume;
    set({ volume });
  },

  next: () => {
    const { queue, queueIndex, repeat, shuffle, audioElement } = get();
    if (queue.length === 0) return;

    let nextIndex: number;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        nextIndex = repeat ? 0 : queue.length - 1;
      }
    }

    const nextTrack = queue[nextIndex];
    if (audioElement && nextTrack) {
      audioElement.src = nextTrack.audioFile;
      audioElement.play();
      set({ currentTrack: nextTrack, queueIndex: nextIndex, isPlaying: true, progress: 0 });
    }
  },

  prev: () => {
    const { queue, queueIndex, audioElement } = get();
    if (queue.length === 0) return;

    const prevIndex = queueIndex - 1 < 0 ? queue.length - 1 : queueIndex - 1;
    const prevTrack = queue[prevIndex];
    if (audioElement && prevTrack) {
      audioElement.src = prevTrack.audioFile;
      audioElement.play();
      set({ currentTrack: prevTrack, queueIndex: prevIndex, isPlaying: true, progress: 0 });
    }
  },

  toggleRepeat: () => set((state) => ({ repeat: !state.repeat })),

  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),

  setQueue: (queue) => set({ queue }),

  clear: () => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
    }
    set(initialState);
  },
}));

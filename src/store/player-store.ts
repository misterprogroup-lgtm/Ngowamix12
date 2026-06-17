import { create } from 'zustand';
import type { Track, PlayerState } from '@/types';
import { getOfflineAudioUrl } from '@/lib/offline-storage';

interface AudioAd {
  id: string;
  sponsor: string;
  text: string;
  audioFile: string;
}

interface PlayerStore extends PlayerState {
  audioElement: HTMLAudioElement | null;
  isAdPlaying: boolean;
  currentAd: AudioAd | null;
  pendingTrack: Track | null;
  userPremium: boolean;
  setAudioElement: (audio: HTMLAudioElement | null) => void;
  setUserPremium: (premium: boolean) => void;
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

function recordListen(trackId: string) {
  fetch('/api/user/listen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trackId }),
  }).catch(() => {});
}

async function fetchAudioAd(): Promise<AudioAd | null> {
  try {
    const res = await fetch('/api/ads/audio');
    const data = await res.json();
    return data.ad;
  } catch {
    return null;
  }
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  ...initialState,
  audioElement: null,
  isAdPlaying: false,
  currentAd: null,
  pendingTrack: null,
  userPremium: false,

  setUserPremium: (premium) => set({ userPremium: premium }),

  setAudioElement: (audio) => set({ audioElement: audio }),

  setTrack: (track, queue, index) => {
    set({
      queue: queue || get().queue,
      queueIndex: index ?? 0,
    });
    get().play(track, queue, index);
  },

  play: async (track, queue, index) => {
    const { audioElement, userPremium, currentAd } = get();
    if (!audioElement) return;

    if (!userPremium && !currentAd) {
      const ad = await fetchAudioAd();
      if (ad) {
        set({ currentAd: ad, pendingTrack: track, isAdPlaying: true, queue: queue || get().queue, queueIndex: index ?? 0 });
        audioElement.src = ad.audioFile;
        audioElement.load();
        audioElement.play().catch(() => {});
        return;
      }
    }

    audioElement.src = track.audioFile;
    audioElement.load();
    audioElement.play().catch(() => {});
    set({
      currentTrack: track,
      isPlaying: true,
      isAdPlaying: false,
      currentAd: null,
      pendingTrack: null,
      progress: 0,
      queue: queue || get().queue,
      queueIndex: index ?? 0,
    });
    recordListen(track.id);
  },

  togglePlay: () => {
    const { audioElement, isPlaying, isAdPlaying } = get();
    if (audioElement) {
      if (!isAdPlaying) {
        isPlaying ? audioElement.pause() : audioElement.play();
        set({ isPlaying: !isPlaying });
      } else {
        isPlaying ? audioElement.pause() : audioElement.play();
        set({ isPlaying: !isPlaying });
      }
    }
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
      get().play(nextTrack, queue, nextIndex);
    }
  },

  prev: () => {
    const { queue, queueIndex, audioElement } = get();
    if (queue.length === 0) return;

    const prevIndex = queueIndex - 1 < 0 ? queue.length - 1 : queueIndex - 1;
    const prevTrack = queue[prevIndex];
    if (audioElement && prevTrack) {
      get().play(prevTrack, queue, prevIndex);
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
    set({ ...initialState, userPremium: get().userPremium });
  },
}));

export interface Track {
  id: string;
  title: string;
  slug: string;
  trackNumber: number;
  duration: number;
  audioFile: string;
  isExplicit: boolean;
  isPremiumOnly: boolean;
  playCount: number;
  createdAt?: string;
  album: {
    id: string;
    title: string;
    coverImage: string | null;
    artist: {
      id: string;
      name: string;
      slug: string;
      avatar: string | null;
    };
  };
}

export interface Album {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  description: string | null;
  genre: string | null;
  country: string | null;
  price: number;
  releaseDate: Date | null;
  isPremiumOnly: boolean;
  totalTracks: number;
  duration: number;
  playCount: number;
  purchaseCount: number;
  artist: {
    id: string;
    name: string;
    slug: string;
    avatar: string | null;
  };
  tracks?: Track[];
}

export interface Artist {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar: string | null;
  coverImage: string | null;
  country: string | null;
  genres: string;
  socialLinks: string | null;
  isVerified: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  phone: string | null;
  phoneVerified: boolean;
  labelName: string | null;
  role: 'LISTENER' | 'ARTIST' | 'LABEL' | 'ADMIN';
  isPremium: boolean;
  premiumExpiresAt: Date | null;
  downloadQuota: number;
  downloadsUsedThisMonth: number;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  queue: Track[];
  queueIndex: number;
  repeat: boolean;
  shuffle: boolean;
}

export type PlayerAction =
  | { type: 'SET_TRACK'; payload: { track: Track; queue?: Track[]; index?: number } }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'TOGGLE_REPEAT' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'SET_QUEUE'; payload: Track[] }
  | { type: 'CLEAR' };

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatar: string | null;
  role: 'LISTENER' | 'ARTIST' | 'LABEL' | 'ADMIN';
  isPremium: boolean;
  token?: string;
}

export interface Album {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  artist: { id: string; name: string; slug: string };
  type: string;
  genre: string | null;
  releaseDate: string | null;
  totalTracks: number;
  duration: number;
  price: number;
}

export interface Track {
  id: string;
  title: string;
  slug: string;
  trackNumber: number;
  duration: number;
  audioFile: string;
  isPremiumOnly: boolean;
  playCount: number;
  album: Album;
}

export interface Artist {
  id: string;
  name: string;
  slug: string;
  avatar: string | null;
  coverImage: string | null;
  genres: string;
  bio: string | null;
  isVerified: boolean;
}

export interface Podcast {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  description: string | null;
  category: string | null;
  author: string | null;
  _count: { episodes: number };
}

export interface Episode {
  id: string;
  title: string;
  audioFile: string;
  duration: number;
  episodeNumber: number;
  isPublished: boolean;
}

export interface Livestream {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  status: 'LIVE' | 'ENDED' | 'SCHEDULED';
  viewerCount: number;
  artist: { id: string; name: string; slug: string; avatar: string | null };
  _count: { chats: number };
}

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; displayName: string | null; avatar: string | null; role: string };
}

export interface ChatRoom {
  id: string;
  type: string;
  name: string;
  slug: string;
  _count: { messages: number; participants: number };
}

export interface FamilyGroup {
  id: string;
  name: string;
  maxMembers: number;
  members: FamilyMember[];
  price: number;
  currency: string;
}

export interface FamilyMember {
  id: string;
  role: string;
  status: string;
  user: { id: string; displayName: string | null; email: string; avatar: string | null; isPremium: boolean };
}

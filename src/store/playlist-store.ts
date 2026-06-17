import { create } from 'zustand';
import type { Playlist } from '@/types';

export interface CollaboratorUser {
  id: string;
  displayName: string | null;
  email: string;
  avatar: string | null;
}

export interface PlaylistCollaborator {
  id: string;
  playlistId: string;
  userId: string;
  role: 'EDITOR' | 'VIEWER';
  createdAt: string;
  user: CollaboratorUser;
}

interface PlaylistState {
  playlists: Playlist[];
  loading: boolean;
  fetchPlaylists: () => Promise<void>;
  createPlaylist: (name: string) => Promise<Playlist | null>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<boolean>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<boolean>;
  deletePlaylist: (playlistId: string) => Promise<boolean>;
  getPlaylist: (playlistId: string) => Promise<Playlist | null>;
  getCollaborators: (playlistId: string) => Promise<PlaylistCollaborator[]>;
  addCollaborator: (playlistId: string, email: string, role?: string) => Promise<PlaylistCollaborator | null>;
  updateCollaborator: (playlistId: string, collaboratorId: string, role: string) => Promise<boolean>;
  removeCollaborator: (playlistId: string, collaboratorId: string) => Promise<boolean>;
}

export const usePlaylistStore = create<PlaylistState>()((set, get) => ({
  playlists: [],
  loading: false,

  fetchPlaylists: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/playlists');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      set({ playlists: data.playlists, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createPlaylist: async (name: string) => {
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const playlist = data.playlist;
      set((state) => ({ playlists: [playlist, ...state.playlists] }));
      return playlist;
    } catch {
      return null;
    }
  },

  addTrackToPlaylist: async (playlistId: string, trackId: string) => {
    try {
      const res = await fetch(`/api/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
      });
      if (!res.ok) return false;
      return true;
    } catch {
      return false;
    }
  },

  removeTrackFromPlaylist: async (playlistId: string, trackId: string) => {
    try {
      const res = await fetch(`/api/playlists/${playlistId}/tracks`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  deletePlaylist: async (playlistId: string) => {
    try {
      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
      });
      if (!res.ok) return false;
      set((state) => ({
        playlists: state.playlists.filter((p) => p.id !== playlistId),
      }));
      return true;
    } catch {
      return false;
    }
  },

  getPlaylist: async (playlistId: string) => {
    try {
      const res = await fetch(`/api/playlists/${playlistId}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.playlist;
    } catch {
      return null;
    }
  },

  getCollaborators: async (playlistId: string) => {
    try {
      const res = await fetch(`/api/playlists/${playlistId}/collaborators`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.collaborators;
    } catch {
      return [];
    }
  },

  addCollaborator: async (playlistId: string, email: string, role = 'EDITOR') => {
    try {
      const res = await fetch(`/api/playlists/${playlistId}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.collaborator;
    } catch {
      return null;
    }
  },

  updateCollaborator: async (playlistId: string, collaboratorId: string, role: string) => {
    try {
      const res = await fetch(`/api/playlists/${playlistId}/collaborators`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collaboratorId, role }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  removeCollaborator: async (playlistId: string, collaboratorId: string) => {
    try {
      const res = await fetch(`/api/playlists/${playlistId}/collaborators`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collaboratorId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
}));

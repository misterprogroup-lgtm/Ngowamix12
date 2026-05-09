import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null, token?: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      setUser: (user, token) => set({ user, token: token ?? null }),
      setLoading: (isLoading) => set({ isLoading }),
      checkSession: async () => {
        try {
          const res = await fetch('/api/user/status');
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              set({ user: data.user, isLoading: false });
            }
          }
        } catch {
          // No session
        }
      },
      logout: async () => {
        try {
          const res = await fetch('/api/auth/logout', { method: 'POST' });
          if (res.ok) {
            set({ user: null, token: null });
            window.location.href = '/login';
          }
        } catch (error) {
          console.error('Logout error:', error);
          set({ user: null, token: null });
          window.location.href = '/login';
        }
      },
    }),
    { name: 'ngowamix-auth' }
  )
);

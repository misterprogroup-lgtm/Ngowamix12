'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { ROUTES } from '@/lib/constants';
import type { User } from '@/types';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: 'signin' | 'signup' | 'use';
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number;
            }
          ) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export function GoogleSignInButton({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const router = useRouter();
  const { setUser, setLoading } = useAuthStore();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [loading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || scriptLoaded) return;

    if (window.google?.accounts) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [scriptLoaded]);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !scriptLoaded || !window.google?.accounts || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        setIsLoading(true);
        setError('');
        setLoading(true);
        try {
          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Erreur Google');

          setUser(data.user as User, data.token);
          const role = data.user?.role;
          if (role === 'ARTIST') router.push('/artist/dashboard');
          else if (role === 'LABEL') router.push('/label/dashboard');
          else if (role === 'ADMIN') router.push('/admin/dashboard');
          else router.push(ROUTES.USER_DASHBOARD);
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erreur de connexion');
        } finally {
          setIsLoading(false);
          setLoading(false);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      context: mode === 'signup' ? 'signup' : 'signin',
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: mode === 'signup' ? 'signup_with' : 'continue_with',
      shape: 'rectangular',
      width: 400,
      logo_alignment: 'center',
    });

    return () => {
      window.google?.accounts.id.disableAutoSelect();
    };
  }, [mode, router, setUser, setLoading, scriptLoaded]);

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error text-center">
          {error}
        </div>
      )}
      <div ref={buttonRef} className="flex justify-center min-h-[40px]" />
      {loading && (
        <p className="text-xs text-text-muted text-center">Connexion en cours...</p>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { ROUTES } from '@/lib/constants';
import type { User } from '@/types';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getDefaultRedirect = (_role?: string) => {
    return ROUTES.HOME;
  };

  const redirect = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }

      setUser(data.user as User, data.token);
      router.push(redirect || getDefaultRedirect(data.user?.role));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}

      <Input
        type="email"
        label="Email"
        placeholder="votre@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />

      <Input
        type="password"
        label="Mot de passe"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />

      <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
        Se connecter
      </Button>

      <p className="text-center text-sm text-text-secondary">
        Pas encore de compte ?{' '}
        <Link href={ROUTES.REGISTER} className="text-primary hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </form>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/store/auth-store';

export function VerifyPhoneForm() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    sendCode();
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const sendCode = async () => {
    setResending(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-verification', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage('Code de vérification envoyé par SMS');
      setCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      const target = user?.role === 'LABEL' ? '/label/dashboard'
        : user?.role === 'ARTIST' ? '/artist/dashboard'
        : user?.role === 'ADMIN' ? '/admin/dashboard'
        : ROUTES.USER_DASHBOARD;

      router.push(target);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
          {message}
        </div>
      )}

      <p className="text-sm text-text-secondary text-center">
        Un code de vérification à 6 chiffres vous a été envoyé par SMS.
      </p>

      <Input
        label="Code de vérification"
        placeholder="123456"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        required
        maxLength={6}
        inputMode="numeric"
        autoComplete="one-time-code"
      />

      <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
        Vérifier
      </Button>

      <p className="text-center">
        <button
          type="button"
          className="text-sm text-primary hover:underline disabled:opacity-50 disabled:no-underline"
          onClick={sendCode}
          disabled={resending || cooldown > 0}
        >
          {cooldown > 0
            ? `Renvoyer le code (${cooldown}s)`
            : resending ? 'Envoi...' : 'Renvoyer le code'}
        </button>
      </p>
    </form>
  );
}

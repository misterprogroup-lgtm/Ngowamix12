'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10 mx-auto">
          <AlertCircle className="h-8 w-8 text-error" />
        </div>
        <h1 className="text-2xl font-bold">Lien invalide</h1>
        <p className="text-text-secondary">Ce lien de réinitialisation est invalide.</p>
        <Link href={ROUTES.FORGOT_PASSWORD}>
          <Button variant="primary">Demander un nouveau lien</Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mx-auto">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h1 className="text-2xl font-bold">Mot de passe réinitialisé</h1>
        <p className="text-text-secondary">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
        <Link href={ROUTES.LOGIN}>
          <Button variant="primary">Se connecter</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mx-auto mb-4">
          <Lock className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
        <p className="text-text-secondary mt-2">Choisissez un nouveau mot de passe</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">
            {error}
          </div>
        )}

        <Input
          type="password"
          label="Nouveau mot de passe"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />

        <Input
          type="password"
          label="Confirmer le mot de passe"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
        />

        <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          Réinitialiser
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

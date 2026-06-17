'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mx-auto">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h1 className="text-2xl font-bold">Email envoyé</h1>
        <p className="text-text-secondary">
          Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation.
        </p>
        <Link href={ROUTES.LOGIN}>
          <Button variant="outline">Retour à la connexion</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mx-auto mb-4">
          <Mail className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
        <p className="text-text-secondary mt-2">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>

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

        <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          Envoyer le lien
        </Button>
      </form>

      <Link href={ROUTES.LOGIN} className="flex items-center justify-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Retour à la connexion
      </Link>
    </div>
  );
}

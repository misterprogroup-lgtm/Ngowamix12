'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useAuthStore } from '@/store/auth-store';
import { ROUTES } from '@/lib/constants';
import type { User } from '@/types';

export function RegisterForm() {
  const router = useRouter();
  const { setUser, setLoading } = useAuthStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState('LISTENER');
  const [artistName, setArtistName] = useState('');
  const [labelName, setLabelName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (accountType === 'ARTIST' && !artistName.trim()) {
      setError('Le nom d\'artiste est requis');
      return;
    }

    if (accountType === 'LABEL' && !labelName.trim()) {
      setError('Le nom du label est requis');
      return;
    }

    if (!acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation');
      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phone: phone || undefined,
          email,
          password,
          role: accountType,
          artistName: accountType === 'ARTIST' ? artistName : undefined,
          labelName: accountType === 'LABEL' ? labelName : undefined,
          acceptTerms: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      setUser(data.user as User, data.token);
      if (phone) {
        router.push('/verify-phone');
      } else if (accountType === 'ARTIST') {
        router.push('/artist/dashboard');
      } else if (accountType === 'LABEL') {
        router.push('/label/dashboard');
      } else {
        router.push(ROUTES.USER_DASHBOARD);
      }
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

      <Select
        label="Type de compte"
        value={accountType}
        onChange={(e) => setAccountType(e.target.value)}
        options={[
          { value: 'LISTENER', label: 'Auditeur' },
          { value: 'ARTIST', label: 'Artiste' },
          { value: 'LABEL', label: 'Label / Producteur' },
        ]}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Prénom"
          placeholder="Jean"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <Input
          label="Nom"
          placeholder="Kouassi"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>

      <Input
        type="tel"
        label="Téléphone"
        placeholder="+225 01 02 03 04 05"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        autoComplete="tel"
      />

      {accountType === 'ARTIST' && (
        <Input
          label="Nom d'artiste"
          placeholder="Votre nom de scène"
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
        />
      )}

      {accountType === 'LABEL' && (
        <Input
          label="Nom du label"
          placeholder="Nom de votre label"
          value={labelName}
          onChange={(e) => setLabelName(e.target.value)}
        />
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
        placeholder="Min. 6 caractères"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="new-password"
      />

      <Input
        type="password"
        label="Confirmer le mot de passe"
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        autoComplete="new-password"
      />

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
        />
        <span className="text-sm text-text-secondary">
          J'accepte les{' '}
          <Link href="/terms" className="text-primary hover:underline" target="_blank">
            conditions d'utilisation
          </Link>{' '}
          et la{' '}
          <Link href="/privacy" className="text-primary hover:underline" target="_blank">
            politique de confidentialité
          </Link>{' '}
          de Ngowamix
        </span>
      </label>

      <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
        Créer mon compte
      </Button>

      <p className="text-center text-sm text-text-secondary">
        Déjà inscrit ?{' '}
        <Link href={ROUTES.LOGIN} className="text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}

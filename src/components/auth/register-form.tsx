'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useAuthStore } from '@/store/auth-store';
import { ROUTES } from '@/lib/constants';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
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
  const [referralCode, setReferralCode] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (showOTP) {
      otpRefs.current[0]?.focus();
    }
  }, [showOTP]);

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    setOtpError('');
    const nextIndex = Math.min(pasted.length, 5);
    otpRefs.current[nextIndex]?.focus();
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch('/api/auth/resend-otp', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setOtpError('Veuillez entrer le code complet');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (accountType === 'ARTIST') {
        router.push('/artist/dashboard');
      } else if (accountType === 'LABEL') {
        router.push('/label/dashboard');
      } else {
        router.push(ROUTES.USER_DASHBOARD);
      }
      router.refresh();
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Code incorrect');
    } finally {
      setOtpLoading(false);
    }
  };

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
          referralCode: referralCode || undefined,
          acceptTerms: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      setUser(data.user as User, data.token);
      setShowOTP(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  if (showOTP) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Vérifiez votre email</h2>
          <p className="text-text-secondary mt-2 text-sm">
            Un code à 6 chiffres a été envoyé à <strong>{email}</strong>
          </p>
        </div>

        {otpError && (
          <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error text-center">
            {otpError}
          </div>
        )}

        <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { otpRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              className="h-14 w-11 rounded-lg border border-border bg-surface text-center text-xl font-bold text-text-primary focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          ))}
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleVerifyOtp}
          isLoading={otpLoading}
        >
          Vérifier mon email
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
            {resending ? 'Envoi...' : 'Renvoyer le code'}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowOTP(false)}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mx-auto"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Modifier mes informations
        </button>
      </div>
    );
  }

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

      <Input
        label="Code de parrainage (optionnel)"
        placeholder="Nom d'un artiste (ex: DAVINCI)"
        value={referralCode}
        onChange={(e) => setReferralCode(e.target.value)}
      />

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-1 h-4 w-4 rounded-sm border-border bg-background text-primary focus:ring-primary"
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

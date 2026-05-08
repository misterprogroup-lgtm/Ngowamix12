'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Crown, Clock, AlertCircle, Download, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PREMIUM_PRICE, PREMIUM_CURRENCY, FREE_DOWNLOAD_QUOTA } from '@/lib/constants';
import { useAuthStore } from '@/store/auth-store';
import type { User } from '@/types';

export default function SubscriptionPage() {
  const { user, setUser } = useAuthStore();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/user/status')
      .then((res) => res.json())
      .then((data) => {
        setUserData(data.user);
        if (data.user) {
          setUser(data.user as User);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [setUser]);

  const handleSubscribe = async () => {
    setSubscribing(true);
    setError('');

    try {
      const res = await fetch('/api/payment/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: PREMIUM_PRICE,
          description: 'Abonnement Premium mensuel',
          type: 'SUBSCRIPTION',
          productId: 'premium_subscription',
          paymentMethod: 'MOBILE_MONEY',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      window.location.href = data.paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 bg-surface-hover rounded" />
          <div className="h-32 bg-surface-hover rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Crown className="h-6 w-6 text-accent" />
        Mon abonnement
      </h1>

      {error && (
        <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error mb-6">
          {error}
        </div>
      )}

      {userData?.isPremium ? (
        <>
          {/* Premium Active */}
          <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="h-6 w-6 text-accent" />
              <h2 className="text-xl font-bold">Premium actif</h2>
              <Badge variant="premium">Actif</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Expiration</span>
                  <span className="text-sm font-medium">
                    {userData.premiumExpiresAt
                      ? new Date(userData.premiumExpiresAt).toLocaleDateString('fr-FR')
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Prochain renouvellement</span>
                  <span className="text-sm font-medium">
                    {userData.premiumExpiresAt
                      ? new Date(userData.premiumExpiresAt).toLocaleDateString('fr-FR')
                      : '—'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    Téléchargements
                  </span>
                  <span className="text-sm font-medium text-success">
                    Illimité
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="rounded-xl border border-border p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Vos avantages Premium</h2>
            <ul className="space-y-3">
              {[
                'Écoute sans publicité',
                'Qualité audio supérieure',
                'Téléchargements illimités',
                'Accès prioritaire aux nouveautés',
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-text-secondary">
                  <Check className="h-4 w-4 text-success shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <>
          {/* Not Premium */}
          <div className="rounded-xl border border-border p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-5 w-5 text-warning" />
              <h2 className="text-lg font-semibold">Pas d&apos;abonnement actif</h2>
            </div>
            <p className="text-text-secondary mb-6">
              Passez au Premium pour profiter de l&apos;écoute sans publicité et des téléchargements illimités.
            </p>
            <Button
              variant="premium"
              size="lg"
              onClick={handleSubscribe}
              isLoading={subscribing}
            >
              <Crown className="h-5 w-5 mr-2" />
              Activer Premium — {PREMIUM_PRICE} {PREMIUM_CURRENCY}/mois
            </Button>
          </div>

          <div className="rounded-xl border border-border p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Download className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Téléchargements gratuits</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Utilisés ce mois</span>
                <span className="text-sm font-bold">
                  {userData.downloadsUsedThisMonth || 0} / {FREE_DOWNLOAD_QUOTA}
                </span>
              </div>
              <div className="w-full bg-surface-hover rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, ((userData.downloadsUsedThisMonth || 0) / FREE_DOWNLOAD_QUOTA) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-text-muted">
                {FREE_DOWNLOAD_QUOTA - (userData.downloadsUsedThisMonth || 0)} téléchargements restants
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Informations</h2>
            </div>
            <ul className="space-y-3 text-text-secondary">
              <li>• L&apos;abonnement est renouvelé automatiquement chaque mois</li>
              <li>• Vous pouvez annuler à tout moment</li>
              <li>• L&apos;accès premium reste actif jusqu&apos;à la fin de la période payée</li>
              <li>• Paiement sécurisé via Mobile Money ou carte bancaire (CinetPay)</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

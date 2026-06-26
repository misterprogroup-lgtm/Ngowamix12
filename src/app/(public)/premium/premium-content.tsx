'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Crown, Check, AlertCircle, Loader2, Gift, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES, PREMIUM_PRICE, PREMIUM_CURRENCY } from '@/lib/constants';
import { useAuthStore } from '@/store/auth-store';

function PremiumContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [plan, setPlan] = useState<'monthly' | 'annual'>('monthly');
  const [config, setConfig] = useState({
    premiumPrice: PREMIUM_PRICE,
    premium12mPrice: PREMIUM_PRICE * 12,
    premiumCurrency: PREMIUM_CURRENCY,
  });
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoData, setPromoData] = useState<{ promoCodeId: string; code: string } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const effectivePrice = plan === 'annual' ? config.premium12mPrice : config.premiumPrice;
  const finalPrice = Math.max(0, effectivePrice - discount);

  const transactionId = searchParams.get('transactionId');

  useEffect(() => {
    fetch('/api/public/config')
      .then((r) => r.json())
      .then((data) => {
        setConfig({
          premiumPrice: data.premiumPrice ?? 1500,
          premium12mPrice: data.premium12mPrice ?? 18000,
          premiumCurrency: data.premiumCurrency ?? 'XOF',
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (transactionId) {
      verifyPayment(transactionId);
    }
  }, [transactionId, pollCount]);

  const verifyPayment = async (id: string) => {
    setPaymentStatus('processing');
    try {
      const res = await fetch(`/api/payment/verify?transactionId=${id}`);
      const data = await res.json();

      if (data.transaction?.status === 'PAID') {
        setPaymentStatus('success');
        if (data.transaction.type === 'SUBSCRIPTION') {
          setUser({ ...user, isPremium: true } as never);
        }
      } else if (data.processing) {
        if (pollCount < 20) {
          setTimeout(() => setPollCount((c) => c + 1), 3000);
        } else {
          setPaymentStatus('error');
        }
      } else {
        setPaymentStatus('error');
      }
    } catch {
      setPaymentStatus('error');
    }
  };

  const validatePromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    setDiscount(0);
    setPromoData(null);
    try {
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, amount: effectivePrice }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setDiscount(data.discount);
        setPromoData({ promoCodeId: data.promoCodeId, code: data.code });
      } else {
        setPromoError(data.error || 'Code invalide');
      }
    } catch {
      setPromoError('Erreur de vérification');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      router.push(`${ROUTES.LOGIN}?redirect=/premium`);
      return;
    }

    setIsLoading(true);
    const isAnnual = plan === 'annual';
    try {
      const res = await fetch('/api/payment/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalPrice,
          originalAmount: isAnnual ? config.premium12mPrice : config.premiumPrice,
          description: isAnnual ? 'Abonnement Premium 12 mois + 2 offerts' : 'Abonnement Premium mensuel',
          type: 'SUBSCRIPTION',
          productId: isAnnual ? 'premium_subscription_12m' : 'premium_subscription',
          ...(promoData ? { promoCodeId: promoData.promoCodeId, promoCode: promoData.code } : {}),
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
      setIsLoading(false);
    }
  };

  const features = [
    'Écoute sans publicité',
    'Téléchargements illimités',
    'Qualité audio supérieure',
    'Accès prioritaire aux nouveautés',
  ];

  if (transactionId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        {paymentStatus === 'processing' && (
          <>
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Vérification du paiement...</h1>
            <p className="text-text-secondary">Veuillez patienter quelques instants</p>
          </>
        )}
        {paymentStatus === 'success' && (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 mx-auto mb-6">
              <Check className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Paiement réussi !</h1>
            <p className="text-text-secondary mb-6">Votre abonnement Premium est maintenant actif</p>
            <Badge variant="premium" className="mb-8">
              <Crown className="h-4 w-4 mr-1" />
              Premium actif
            </Badge>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" onClick={() => router.push(ROUTES.USER_DASHBOARD)}>
                Mon espace
              </Button>
              <Button variant="outline" onClick={() => router.push(ROUTES.EXPLORE)}>
                Explorer le catalogue
              </Button>
            </div>
          </>
        )}
        {paymentStatus === 'error' && (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-error/10 mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-error" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Paiement non confirmé</h1>
            <p className="text-text-secondary mb-6">Le paiement n&apos;a pas pu être vérifié</p>
            <Button variant="primary" onClick={() => router.push('/premium')}>
              Réessayer
            </Button>
          </>
        )}
      </div>
    );
  }

  if (user?.isPremium && !transactionId) {
    return (
      <div className="container mx-auto px-4 py-12 pb-24 text-center">
        <div className="max-w-md mx-auto">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mx-auto mb-6">
            <Crown className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Vous êtes déjà Premium</h1>
          <p className="text-text-secondary mb-6">
            Votre abonnement est actif jusqu&apos;au {user.premiumExpiresAt ? new Date(user.premiumExpiresAt).toLocaleDateString('fr-FR') : '—'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={() => router.push(ROUTES.USER_DASHBOARD)}>
              Mon espace
            </Button>
            <Button variant="outline" onClick={() => router.push(ROUTES.EXPLORE)}>
              Explorer le catalogue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 pb-24">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <Badge variant="premium" className="mb-4">
          <Crown className="h-4 w-4 mr-1" />
          Premium
        </Badge>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Passez à l&apos;expérience premium
        </h1>
        <p className="text-xl text-text-secondary mb-8">
          {plan === 'annual'
            ? `${config.premium12mPrice.toLocaleString()} ${config.premiumCurrency} pour 14 mois`
            : `${config.premiumPrice.toLocaleString()} ${config.premiumCurrency} par mois`
          }
        </p>

        <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setPlan('monthly')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              plan === 'monthly'
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Mensuel
          </button>
          <button
            type="button"
            onClick={() => setPlan('annual')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              plan === 'annual'
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Annuel</span>
            <Badge variant="success" className="ml-2 text-[10px] px-1.5 py-0.5">
              -33%
            </Badge>
          </button>
        </div>
      </div>

      {error && (
        <div className="max-w-md mx-auto mb-6 rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
        <div className="rounded-xl border border-border p-6">
          <h2 className="text-xl font-bold mb-4">Gratuit</h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-text-secondary">
              <Check className="h-4 w-4 text-success shrink-0" />
              Écoute en streaming
            </li>
            <li className="flex items-center gap-2 text-text-secondary">
              <Check className="h-4 w-4 text-success shrink-0" />
              Recherche dans le catalogue
            </li>
            <li className="flex items-center gap-2 text-text-secondary">
              <Check className="h-4 w-4 text-success shrink-0" />
              Favoris
            </li>
            <li className="flex items-center gap-2 text-text-muted">
              <span className="text-error">✕</span>
              Publicités
            </li>
            <li className="flex items-center gap-2 text-text-muted">
              <span className="text-error">✕</span>
              Téléchargements
            </li>
          </ul>
        </div>

        <div className="rounded-xl border-2 border-primary p-6 relative bg-gradient-to-br from-primary/[0.03] to-transparent shadow-lg shadow-primary/10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge variant="premium" className="shadow-lg shadow-primary/30">Recommandé</Badge>
          </div>
          <h2 className="text-xl font-bold mb-1">Premium</h2>
          {plan === 'annual' ? (
            <>
              <p className="text-sm text-text-muted line-through mb-1">
                {config.premium12mPrice.toLocaleString()} {config.premiumCurrency}
              </p>
              <p className="text-3xl font-bold text-primary mb-1">
                {config.premium12mPrice.toLocaleString()} <span className="text-base text-text-secondary">{config.premiumCurrency}</span>
              </p>
              <p className="text-xs text-success font-medium mb-4">
                <Zap className="h-3 w-3 inline mr-0.5" />
                14 mois au lieu de 12 — 2 mois offerts !
              </p>
            </>
          ) : (
            <p className="text-3xl font-bold text-primary mb-4">
              {config.premiumPrice.toLocaleString()} <span className="text-base text-text-secondary">{config.premiumCurrency}/mois</span>
            </p>
          )}
          <ul className="space-y-3 mb-6">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mb-4 rounded-lg border border-border bg-surface/50 p-3 text-center">
            <p className="text-sm text-text-secondary">
              Paiement sécurisé par <strong>PawaPay</strong> — Mobile Money & Cartes
            </p>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-text-secondary">Code promo</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setDiscount(0); setPromoData(null); setPromoError(''); }}
                placeholder="EX: PROMO10"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
              <Button variant="outline" size="sm" onClick={validatePromo} isLoading={promoLoading}>
                <Gift className="h-4 w-4" />
              </Button>
            </div>
            {promoError && <p className="text-xs text-error">{promoError}</p>}
            {discount > 0 && (
              <p className="text-xs text-success flex items-center gap-1">
                <Check className="h-3 w-3" />
                Réduction de {discount.toLocaleString()} XOF appliquée
              </p>
            )}
          </div>

          <div className="mb-4 text-center">
            {discount > 0 ? (
              <>
                <p className="text-sm text-text-muted line-through">{effectivePrice.toLocaleString()} {config.premiumCurrency}</p>
                <p className="text-2xl font-bold text-primary">{finalPrice.toLocaleString()} <span className="text-sm text-text-secondary">{config.premiumCurrency}</span></p>
              </>
            ) : (
              <p className="text-sm text-text-muted">
                {plan === 'annual'
                  ? `${config.premium12mPrice.toLocaleString()} ${config.premiumCurrency} pour 14 mois`
                  : `${config.premiumPrice.toLocaleString()} ${config.premiumCurrency} / mois`
                }
              </p>
            )}
          </div>

          <Button
            variant="premium"
            size="lg"
            className="w-full"
            onClick={handleSubscribe}
            isLoading={isLoading}
          >
            <Crown className="h-5 w-5 mr-2" />
            {plan === 'annual' ? 'S\'abonner pour 14 mois' : 'S\'abonner maintenant'}
          </Button>
        </div>
      </div>

      <div className="text-center text-sm text-text-muted">
        <p>Paiement sécurisé via PawaPay — Mobile Money & Cartes bancaires</p>
        <p className="mt-1">Annulation possible à tout moment</p>
      </div>
    </div>
  );
}

export default PremiumContent;

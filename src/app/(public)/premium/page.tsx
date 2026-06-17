import type { Metadata } from 'next';
import { Suspense } from 'react';
import { APP_NAME, PREMIUM_PRICE, PREMIUM_CURRENCY } from '@/lib/constants';
import PremiumContent from './premium-content';

export const metadata: Metadata = {
  title: `Abonnement Premium — ${APP_NAME}`,
  description: `Passez à Premium pour ${PREMIUM_PRICE.toLocaleString()} ${PREMIUM_CURRENCY}/mois. Écoute sans pub, téléchargements illimités, qualité audio supérieure.`,
  alternates: { canonical: '/premium' },
  openGraph: {
    title: `Abonnement Premium — ${APP_NAME}`,
    description: `Passez à Premium pour ${PREMIUM_PRICE.toLocaleString()} ${PREMIUM_CURRENCY}/mois. Écoute sans pub, téléchargements illimités, qualité audio supérieure.`,
    url: '/premium',
    siteName: APP_NAME,
    type: 'website',
    images: [{ url: '/og.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Abonnement Premium — ${APP_NAME}`,
    description: `Passez à Premium pour ${PREMIUM_PRICE.toLocaleString()} ${PREMIUM_CURRENCY}/mois.`,
    images: ['/og.jpg'],
  },
};

export default function PremiumPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16"><p>Chargement...</p></div>}>
      <PremiumContent />
    </Suspense>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Crown, SkipForward } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';

interface AdData {
  id: string;
  image: string;
  sponsor: string;
  text: string;
  link: string | null;
  placement: string;
}

export function AdPopup() {
  const { user } = useAuthStore();
  const [show, setShow] = useState(false);
  const [ads, setAds] = useState<AdData[]>([]);
  const [currentAd, setCurrentAd] = useState(0);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    fetch('/api/ads?placement=POPUP')
      .then((r) => r.json())
      .then((data) => setAds(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.isPremium || ads.length === 0) return;

    const hasSeenAd = sessionStorage.getItem('ngowamix-ad-seen');
    if (hasSeenAd) return;

    const timer = setTimeout(() => {
      setShow(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, ads]);

  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [show]);

  const handleClose = () => {
    setShow(false);
    try {
      sessionStorage.setItem('ngowamix-ad-seen', 'true');
    } catch {}
  };

  const handleWatchAd = () => {
    setCountdown(10);
    const nextAd = (currentAd + 1) % ads.length;
    setCurrentAd(nextAd);
    handleClose();
  };

  if (!show || ads.length === 0) return null;

  const ad = ads[currentAd];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={handleClose} />
      <div className="relative bg-background rounded-2xl border border-border shadow-2xl max-w-sm w-full overflow-hidden">
        {countdown === 0 && (
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="relative h-40 bg-surface-hover">
          <img src={ad.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-xs text-primary font-semibold uppercase tracking-wider">
              Sponsorisé · {ad.sponsor}
            </p>
            <p className="text-sm text-white font-medium mt-0.5">{ad.text}</p>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-text-primary">Découvrez Ngowamix Premium</h3>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            Écoutez sans publicité, téléchargez vos morceaux préférés et profitez d&apos;une qualité audio supérieure.
          </p>

          <ul className="space-y-1.5 mb-5">
            {['Sans publicité', 'Téléchargements illimités', 'Qualité audio supérieure'].map((benefit) => (
              <li key={benefit} className="flex items-center gap-2 text-xs text-text-secondary">
                <Crown className="h-3.5 w-3.5 text-primary shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2">
            {ad.link ? (
              <Link href={ad.link} onClick={handleClose}>
                <Button variant="premium" size="md" className="w-full">
                  <Crown className="h-4 w-4" />
                  Voir l&apos;offre
                </Button>
              </Link>
            ) : (
              <Link href="/premium" onClick={handleClose}>
                <Button variant="premium" size="md" className="w-full">
                  <Crown className="h-4 w-4" />
                  S&apos;abonner — 1 500 FCFA/mois
                </Button>
              </Link>
            )}

            {countdown > 0 ? (
              <p className="text-center text-xs text-text-muted">
                Fermeture dans {countdown}s
              </p>
            ) : (
              <button
                onClick={handleWatchAd}
                className="flex items-center justify-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors py-1"
              >
                <SkipForward className="h-3 w-3" />
                Voir une autre pub
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

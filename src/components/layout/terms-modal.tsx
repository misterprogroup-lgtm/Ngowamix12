'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';

export function TermsAcceptanceModal() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [sessionLost, setSessionLost] = useState(false);

  useEffect(() => {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    fetch('/api/user/terms', { headers, credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          setSessionLost(true);
          return null;
        }
        if (!res.ok) {
          console.warn('Terms check failed:', res.status);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && !data.termsAccepted) {
          console.log('Terms not accepted, showing modal');
          setShowModal(true);
        }
      })
      .catch((err) => console.error('Terms check error:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAccept = async () => {
    if (!accepted) return;
    setError('');
    setSessionLost(false);
    setIsAccepting(true);
    try {
      console.log('Accepting terms...');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/user/terms', {
        method: 'POST',
        headers,
        credentials: 'include',
      });
      const data = await res.json();
      console.log('Terms response:', res.status, data);
      if (res.ok) {
        console.log('Terms accepted, closing modal');
        setShowModal(false);
        router.refresh();
      } else if (res.status === 401) {
        setSessionLost(true);
        setError('Votre session a expiré. Veuillez vous reconnecter.');
      } else {
        setError(data.error || 'Erreur lors de l\'acceptation');
      }
    } catch (err) {
      console.error('Accept error:', err);
      setError('Erreur de connexion. Vérifiez votre réseau et réessayez.');
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading || !showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Conditions d'utilisation</h2>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 mb-5">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-text-secondary">
              {sessionLost
                ? 'Votre session a expiré. Veuillez vous reconnecter pour continuer.'
                : 'Pour continuer à utiliser Ngowamix, vous devez accepter nos conditions d\'utilisation mises à jour.'}
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error mb-5">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 text-sm text-text-secondary">
            <section>
              <h3 className="font-medium text-text-primary mb-1">1. Service</h3>
              <p>
                Ngowamix est une plateforme de musique africaine permettant l'écoute, l'achat et le téléchargement de contenus musicaux. En utilisant le service, vous vous engagez à respecter nos conditions.
              </p>
            </section>

            <section>
              <h3 className="font-medium text-text-primary mb-1">2. Compte</h3>
              <p>
                Votre compte est personnel et non transférable. Vous êtes responsable de toutes les activités sous votre compte. Un seul compte est autorisé par personne.
              </p>
            </section>

            <section>
              <h3 className="font-medium text-text-primary mb-1">3. Propriété intellectuelle</h3>
              <p>
                Les contenus musicaux restent la propriété de leurs créateurs. Les achats sont pour usage personnel uniquement — la redistribution est interdite.
              </p>
            </section>

            <section>
              <h3 className="font-medium text-text-primary mb-1">4. Paiements</h3>
              <p>
                Les abonnements et achats sont payés d'avance. Les contenus numériques achetés ne sont ni repris ni remboursés.
              </p>
            </section>

            <section>
              <h3 className="font-medium text-text-primary mb-1">5. Données personnelles</h3>
              <p>
                Nous protégeons vos données conformément à notre Politique de Confidentialité. Vous disposez de droits d'accès, de rectification et de suppression.
              </p>
            </section>
          </div>

          {sessionLost ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => { window.location.href = '/login'; }}
            >
              Se connecter
            </Button>
          ) : (
            <>
              <label className="flex items-start gap-3 cursor-pointer mb-6 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-secondary">
                  J'ai lu et j'accepte les{' '}
                  <Link href="/terms" className="text-primary hover:underline" target="_blank">
                    conditions d'utilisation
                  </Link>{' '}
                  et la{' '}
                  <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                    politique de confidentialité
                  </Link>
                </span>
              </label>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isAccepting}
                disabled={!accepted}
                onClick={handleAccept}
              >
                Accepter et continuer
              </Button>

              <Button
                variant="ghost"
                size="lg"
                className="w-full mt-2"
                onClick={logout}
              >
                Quitter
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

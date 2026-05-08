import Link from 'next/link';
import { Crown, Music, ShoppingBag, Heart, Clock, Settings } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { ROUTES, PREMIUM_PRICE, PREMIUM_CURRENCY } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function UserDashboard() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Bonjour, {user.email.split('@')[0]}
          </h1>
          <p className="text-text-secondary mt-1">
            Retrouvez votre activité et vos contenus
          </p>
        </div>
        <Link href={ROUTES.USER_PROFILE}>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Status */}
      <div className="mb-8">
        {user.isPremium ? (
          <div className="rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 p-6 border border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="h-6 w-6 text-accent" />
              <h2 className="text-xl font-bold">Compte Premium actif</h2>
            </div>
            <p className="text-text-secondary">
              Profitez de l&apos;écoute sans publicité et des téléchargements illimités
            </p>
            <Link href={ROUTES.USER_SUBSCRIPTION}>
              <Button variant="outline" size="sm" className="mt-4">
                Gérer mon abonnement
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-border p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold mb-1">Passez au Premium</h2>
                <p className="text-text-secondary">
                  Écoute sans pub, qualité supérieure et téléchargements
                </p>
              </div>
              <Link href="/premium">
                <Button variant="premium">
                  <Crown className="h-5 w-5 mr-2" />
                  {PREMIUM_PRICE} {PREMIUM_CURRENCY}/mois
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href={ROUTES.USER_LIBRARY} className="rounded-xl border border-border p-4 hover:border-primary/30 transition-colors group">
          <Heart className="h-6 w-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-medium">Favoris</h3>
          <p className="text-sm text-text-muted">Vos titres et albums préférés</p>
        </Link>
        <Link href={ROUTES.USER_PURCHASES} className="rounded-xl border border-border p-4 hover:border-primary/30 transition-colors group">
          <ShoppingBag className="h-6 w-6 text-accent mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-medium">Achats</h3>
          <p className="text-sm text-text-muted">Vos albums achetés</p>
        </Link>
        <Link href="/user/recent" className="rounded-xl border border-border p-4 hover:border-primary/30 transition-colors group">
          <Clock className="h-6 w-6 text-success mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-medium">Récents</h3>
          <p className="text-sm text-text-muted">Écoutés récemment</p>
        </Link>
        <Link href={ROUTES.USER_SUBSCRIPTION} className="rounded-xl border border-border p-4 hover:border-primary/30 transition-colors group">
          <Crown className="h-6 w-6 text-warning mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-medium">Abonnement</h3>
          <p className="text-sm text-text-muted">Gérer votre Premium</p>
        </Link>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Activité récente</h2>
        <div className="text-center py-8 text-text-muted">
          <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Vos écoutes récentes apparaîtront ici</p>
          <Link href={ROUTES.EXPLORE}>
            <Button variant="primary" size="sm" className="mt-4">
              Explorer le catalogue
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

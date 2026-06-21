import Link from 'next/link';
import { Mic2, Music, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ArtistCTA() {
  return (
    <section>
      <div className="container mx-auto">
        <div className="relative rounded-2xl overflow-hidden bg-surface border border-border">
          <div className="p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-6">
                <Mic2 className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Vous êtes artiste ou label ?
              </h2>
              <p className="text-text-secondary mb-6 max-w-md">
                Rejoignez Ngowamix et publiez votre musique auprès de milliers
                d&apos;auditeurs. Suivez vos statistiques, gérez votre catalogue
                et monétisez vos œuvres.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3">
                  <Music className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Catalogue illimité</p>
                    <p className="text-xs text-text-muted">
                      Albums, singles, EP sans limite
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Statistiques</p>
                    <p className="text-xs text-text-muted">
                      Écoutes, ventes, revenus en temps réel
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Communauté</p>
                    <p className="text-xs text-text-muted">
                      Fans, partages, playlists
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Monétisation</p>
                    <p className="text-xs text-text-muted">
                      Vente d&apos;albums et premium
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register?role=artist">
                  <Button variant="premium" size="lg">
                    <Mic2 className="h-5 w-5" />
                    Créer un compte artiste
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg">
                    En savoir plus
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hidden md:flex justify-center">
              <div className="w-64 h-64 rounded-full bg-surface-hover flex items-center justify-center">
                <Mic2 className="h-20 w-20 text-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

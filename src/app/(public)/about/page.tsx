import type { Metadata } from 'next';
import { Info, Music, Globe, Crown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Découvrez Ngowamix, la plateforme de streaming musical dédiée à la musique africaine. Notre mission, notre histoire et notre équipe.',
  alternates: { canonical: '/about' },
  openGraph: { title: 'À propos - Ngowamix', description: 'Découvrez Ngowamix, la plateforme de streaming musical africaine.' },
  twitter: { title: 'À propos - Ngowamix', description: 'Découvrez Ngowamix, la plateforme de streaming musical africaine.' },
};

const values = [
  { icon: Music, title: 'Notre Mission', text: 'Ngowamix est une plateforme de streaming musical dédiée à la musique africaine francophone. Notre mission est de connecter les artistes africains avec leur public, tout en offrant une expérience d\'écoute premium et abordable.' },
  { icon: Globe, title: 'Notre Vision', text: 'Nous croyons que la musique africaine mérite une visibilité mondiale. C\'est pourquoi nous avons créé un espace où les artistes peuvent partager leur art, les fans découvrir de nouveaux talents, et tout le monde peut soutenir directement la scène musicale africaine.' },
  { icon: Crown, title: 'Nos Offres', text: 'Notre plateforme offre trois modes d\'accès : l\'écoute gratuite en streaming, l\'abonnement Premium à 1 500 FCFA/mois pour une expérience sans limites, et l\'achat direct d\'albums pour soutenir vos artistes préférés.' },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">À propos</h1>
        </div>
        <div className="space-y-6">
          {values.map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">{item.title}</h2>
              </div>
              <p className="text-text-secondary leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

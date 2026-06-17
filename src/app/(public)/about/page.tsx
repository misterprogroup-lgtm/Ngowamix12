import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Découvrez Ngowamix, la plateforme de streaming musical dédiée à la musique africaine. Notre mission, notre histoire et notre équipe.',
  alternates: { canonical: '/about' },
  openGraph: { title: 'À propos - Ngowamix', description: 'Découvrez Ngowamix, la plateforme de streaming musical africaine.' },
  twitter: { title: 'À propos - Ngowamix', description: 'Découvrez Ngowamix, la plateforme de streaming musical africaine.' },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto py-8 pb-24 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">À propos</h1>
      <div className="space-y-4 text-text-secondary">
        <p>
          Ngowamix est une plateforme de streaming musical dédiée à la musique africaine francophone. 
          Notre mission est de connecter les artistes africains avec leur public, tout en offrant une 
          expérience d&apos;écoute premium et abordable.
        </p>
        <p>
          Nous croyons que la musique africaine mérite une visibilité mondiale. C&apos;est pourquoi nous 
          avons créé un espace où les artistes peuvent partager leur art, les fans découvrir de nouveaux 
          talents, et tout le monde peut soutenir directement la scène musicale africaine.
        </p>
        <p>
          Notre plateforme offre trois modes d&apos;accès : l&apos;écoute gratuite en streaming, 
          l&apos;abonnement Premium à 1 500 FCFA/mois pour une expérience sans limites, et l&apos;achat 
          direct d&apos;albums pour soutenir vos artistes préférés.
        </p>
      </div>
    </div>
  );
}

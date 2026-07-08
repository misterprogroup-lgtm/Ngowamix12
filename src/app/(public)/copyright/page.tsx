import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de droits d\'auteur',
  description: 'Politique de droits d\'auteur de Ngowamix. Déclarez une infraction, comprendre nos règles de copyright pour les artistes et utilisateurs.',
  alternates: { canonical: '/copyright' },
  openGraph: { title: 'Politique de droits d\'auteur - Ngowamix', description: 'Politique de droits d\'auteur de Ngowamix.' },
  twitter: { title: 'Politique de droits d\'auteur - Ngowamix', description: 'Politique de droits d\'auteur de Ngowamix.' },
};

export default function CopyrightPage() {
  return (
    <div className="container mx-auto px-4 py-8 pb-24 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Politique de droits d&apos;auteur</h1>
      <div className="space-y-4 text-text-secondary text-sm">
        <p>
          Ngowamix respecte les droits d&apos;auteur et les droits de propriété intellectuelle 
          des artistes, labels et producteurs.
        </p>
        <h2 className="text-lg font-bold text-text-primary">Contenu protégé</h2>
        <p>
          Toute la musique disponible sur la plateforme est protégée par les lois sur le droit d&apos;auteur. 
          L&apos;écoute via le streaming et le téléchargement après achat sont les seuls usages autorisés.
        </p>
        <h2 className="text-lg font-bold text-text-primary">Signalement</h2>
        <p>
          Si vous estimez qu&apos;un contenu enfreint vos droits d&apos;auteur, contactez-nous à 
          copyright@ngowamix.com avec les détails de votre réclamation.
        </p>
        <h2 className="text-lg font-bold text-text-primary">Artistes partenaires</h2>
        <p>
          Les artistes et labels qui publient sur Ngowamix garantissent détenir les droits 
          nécessaires sur le contenu qu&apos;ils mettent en ligne.
        </p>
      </div>
    </div>
  );
}

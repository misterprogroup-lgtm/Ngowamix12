import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez l\'équipe Ngowamix. Support technique, partenariats, presse et réclamations.',
  alternates: { canonical: '/contact' },
  openGraph: { title: 'Contact - Ngowamix', description: 'Contactez l\'équipe Ngowamix.' },
  twitter: { title: 'Contact - Ngowamix', description: 'Contactez l\'équipe Ngowamix.' },
};

export default function ContactPage() {
  return (
    <div className="container mx-auto py-8 pb-24 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Contact</h1>
      <div className="space-y-4 text-text-secondary">
        <p>Pour toute question ou demande d&apos;information, contactez-nous :</p>
        <ul className="space-y-2">
          <li>Email : support@ngowamix.com</li>
          <li>Disponible du lundi au vendredi, 9h-18h</li>
        </ul>
        <p className="text-sm text-text-muted">
          Pour les artistes souhaitant rejoindre la plateforme, envoyez votre demande à artistes@ngowamix.com
        </p>
      </div>
    </div>
  );
}

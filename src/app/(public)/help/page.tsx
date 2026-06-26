import type { Metadata } from 'next';
import { HeadphonesIcon, Crown, ShoppingCart, Download, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Aide & Support',
  description: 'Consultez les questions fréquentes et obtenez de l\'aide sur Ngowamix : inscriptions, abonnements, téléchargements, et plus.',
  alternates: { canonical: '/help' },
  openGraph: { title: 'Aide & Support - Ngowamix', description: 'Obtenez de l\'aide sur Ngowamix.' },
  twitter: { title: 'Aide & Support - Ngowamix', description: 'Obtenez de l\'aide sur Ngowamix.' },
};

const faqs = [
  {
    icon: HeadphonesIcon,
    q: 'Comment écouter de la musique ?',
    a: 'Parcourez le catalogue, cliquez sur un artiste ou un album, puis appuyez sur le bouton Play. Le lecteur audio apparaîtra en bas de l\'écran.',
  },
  {
    icon: Crown,
    q: 'Comment passer Premium ?',
    a: 'Rendez-vous sur la page Premium, choisissez votre mode de paiement (Mobile Money ou carte bancaire) et validez. L\'accès est immédiat.',
  },
  {
    icon: ShoppingCart,
    q: 'Comment acheter un album ?',
    a: 'Sur la page de l\'album, cliquez sur "Acheter", choisissez votre moyen de paiement et validez. L\'album sera ajouté à votre bibliothèque.',
  },
  {
    icon: Download,
    q: 'Téléchargements Premium',
    a: 'Les abonnés Premium peuvent télécharger jusqu\'à 30 titres par mois. Le compteur est réinitialisé à chaque cycle mensuel.',
  },
  {
    icon: MessageCircle,
    q: 'Vous avez d\'autres questions ?',
    a: null,
  },
];

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-12 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <HeadphonesIcon className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Aide & Support</h1>
        </div>
        <div className="space-y-4">
          {faqs.map((item, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold mb-2">{item.q}</h2>
                  {item.a ? (
                    <p className="text-text-secondary leading-relaxed">{item.a}</p>
                  ) : (
                    <p className="text-text-secondary">
                      Consultez la page{' '}
                      <a href="/contact" className="text-primary hover:text-primary-hover transition-colors font-medium">
                        Contact
                      </a>{' '}
                      ou écrivez à{' '}
                      <a href="mailto:support@ngowamix.com" className="text-primary hover:text-primary-hover transition-colors font-medium">
                        support@ngowamix.com
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

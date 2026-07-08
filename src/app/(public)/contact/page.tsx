import type { Metadata } from 'next';
import { Mail, MessageSquare, UserPlus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez l\'équipe Ngowamix. Support technique, partenariats, presse et réclamations.',
  alternates: { canonical: '/contact' },
  openGraph: { title: 'Contact - Ngowamix', description: 'Contactez l\'équipe Ngowamix.' },
  twitter: { title: 'Contact - Ngowamix', description: 'Contactez l\'équipe Ngowamix.' },
};

const contacts = [
  {
    icon: MessageSquare,
    title: 'Support général',
    desc: 'Pour toute question ou demande d\'information',
    email: 'support@ngowamix.com',
    note: 'Disponible du lundi au vendredi, 9h-18h',
  },
  {
    icon: UserPlus,
    title: 'Artistes',
    desc: 'Pour rejoindre la plateforme',
    email: 'artistes@ngowamix.com',
  },
  {
    icon: Mail,
    title: 'Presse & Partenariats',
    desc: 'Pour les demandes presse et partenariats',
    email: 'partenariats@ngowamix.com',
  },
];

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Contact</h1>
        </div>
        <div className="space-y-4">
          {contacts.map((item) => (
            <div key={item.email} className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{item.title}</h2>
                  <p className="text-sm text-text-secondary">{item.desc}</p>
                </div>
              </div>
              <a
                href={`mailto:${item.email}`}
                className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors font-medium"
              >
                {item.email}
              </a>
              {item.note && (
                <p className="text-sm text-text-muted mt-2">{item.note}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

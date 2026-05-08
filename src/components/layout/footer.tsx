import Link from 'next/link';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';

const footerLinks = {
  decouvrir: [
    { label: 'Explorer', href: '/explore' },
    { label: 'Artistes', href: '/explore?type=artist' },
    { label: 'Albums', href: '/explore?type=album' },
    { label: 'Concerts & Tickets', href: '/tickets' },
  ],
  offres: [
    { label: 'Premium', href: '/premium' },
    { label: 'Tarifs', href: '/premium#pricing' },
    { label: 'Acheter un album', href: '/explore' },
  ],
  support: [
    { label: 'Aide', href: '/help' },
    { label: 'Contact', href: '/contact' },
    { label: 'À propos', href: '/about' },
  ],
  legal: [
    { label: 'Conditions générales', href: '/terms' },
    { label: 'Confidentialité', href: '/privacy' },
    { label: 'Copyright', href: '/copyright' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image src="/logo-icon.png" alt="Ngowamix" width={32} height={32} className="h-8 w-8" />
              <span className="text-lg font-bold text-text-primary">{APP_NAME}</span>
            </Link>
            <p className="text-sm text-text-secondary">
              La plateforme de streaming musical africain. Écoutez, découvrez et soutenez les artistes.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-text-primary mb-3 capitalize">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-text-muted">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}

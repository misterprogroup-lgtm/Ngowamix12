import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { Music, ExternalLink } from 'lucide-react';

const footerLinks = {
  Découvrir: [
    { label: 'Explorer', href: '/explore' },
    { label: 'Artistes', href: '/explore?type=artist' },
    { label: 'Albums', href: '/explore?type=album' },
    { label: 'Classements', href: '/explore?sort=plays' },
    { label: 'Podcasts', href: '/podcasts' },
  ],
  Offres: [
    { label: 'Premium', href: '/premium' },
    { label: 'Premium Famille', href: '/premium/family' },
    { label: 'Tickets concert', href: '/tickets' },
    { label: 'Artistes', href: '/register?role=artist' },
  ],
  Support: [
    { label: 'Aide', href: '/help' },
    { label: 'Contact', href: '/contact' },
    { label: 'À propos', href: '/about' },
    { label: 'Chat', href: '/chat' },
  ],
  Légal: [
    { label: 'Conditions générales', href: '/terms' },
    { label: 'Confidentialité', href: '/privacy' },
    { label: 'Copyright', href: '/copyright' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/20 bg-background" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Music className="h-[18px] w-[18px] text-white" />
              </div>
              <span className="text-lg font-black text-white">{APP_NAME}</span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs mb-6">
              La plateforme qui libère les artistes. Écoutez, découvrez et soutenez la musique africaine francophone.
            </p>
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Télécharger l'application</p>
              <div className="flex flex-col gap-2">
                <a
                  href="#"
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-surface border border-border/40 text-white hover:border-primary/40 hover:bg-surface-hover transition-all group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <div>
                    <p className="text-[10px] text-text-muted leading-tight">Télécharger sur</p>
                    <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">App Store</p>
                  </div>
                  <ExternalLink className="h-3 w-3 text-text-muted ml-auto shrink-0" />
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-surface border border-border/40 text-white hover:border-primary/40 hover:bg-surface-hover transition-all group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 010 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                  </svg>
                  <div>
                    <p className="text-[10px] text-text-muted leading-tight">Disponible sur</p>
                    <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">Google Play</p>
                  </div>
                  <ExternalLink className="h-3 w-3 text-text-muted ml-auto shrink-0" />
                </a>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted text-center md:text-left">
            &copy; {new Date().getFullYear()} {APP_NAME}. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://facebook.com/ngowamix"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              href="https://instagram.com/ngowamix"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://twitter.com/ngowamix"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-primary transition-colors"
              aria-label="Twitter"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <span className="text-text-muted/30 hidden sm:inline">|</span>
            <Link href="/terms" className="text-sm text-text-muted hover:text-primary transition-colors">CGU</Link>
            <span className="text-text-muted/30">|</span>
            <Link href="/privacy" className="text-sm text-text-muted hover:text-primary transition-colors">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Music,
  Settings,
  User,
  Radio,
  Wallet,
  Gift,
  Image,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/artist/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/artist/catalog', label: 'Catalogue', icon: Music },
  { href: '/artist/services', label: 'Services', icon: Settings },
  { href: '/artist/profile', label: 'Profil', icon: User },
  { href: '/artist/livestream', label: 'Livestream', icon: Radio },
  { href: '/artist/royalties', label: 'Royalties', icon: Wallet },
  { href: '/artist/referral', label: 'Parrainage', icon: Gift },
  { href: '/artist/stories', label: 'Stories', icon: Image },
];

export default function ArtistLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isDashboardRoute = navLinks.some((l) => pathname.startsWith(l.href));

  if (!isDashboardRoute) {
    return <>{children}</>;
  }

  const isActive = (href: string) => {
    if (href === '/artist/dashboard') return pathname === '/artist/dashboard';
    return pathname.startsWith(href);
  };

  const currentSection = navLinks.find((l) => isActive(l.href));

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 pt-6 pb-28">
        <div className="flex items-center gap-2 text-sm text-text-secondary mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-text-primary font-medium">Espace artiste</span>
          {currentSection && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-text-primary">{currentSection.label}</span>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <nav className="hidden lg:flex flex-col w-64 shrink-0">
            <div className="space-y-1 sticky top-24">
              <h2 className="text-xs font-bold tracking-[0.15em] text-text-muted uppercase px-3 mb-3">
                Espace artiste
              </h2>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300',
                    isActive(link.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  )}
                >
                  <link.icon className={cn(
                    'h-4.5 w-4.5 transition-colors shrink-0',
                    isActive(link.href) ? 'text-primary' : 'text-text-muted'
                  )} />
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="lg:hidden w-full overflow-x-auto scrollbar-hide mb-4 -mx-4 px-4">
            <div className="flex gap-1 p-1 rounded-xl bg-surface border border-border min-w-max">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                    isActive(link.href)
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

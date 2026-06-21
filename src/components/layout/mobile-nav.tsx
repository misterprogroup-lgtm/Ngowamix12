'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

const links = [
  { href: ROUTES.HOME, label: 'Accueil', icon: Home },
  { href: ROUTES.SEARCH, label: 'Rechercher', icon: Search },
  { href: '/user/library', label: 'Bibliothèque', icon: Library },
];

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16">
        {links.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors',
                active ? 'text-primary' : 'text-text-muted hover:text-text-primary'
              )}
            >
              <link.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

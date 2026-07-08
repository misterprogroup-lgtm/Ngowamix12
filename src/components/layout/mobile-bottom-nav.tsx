'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MobileSearchOverlay } from '@/components/layout/mobile-search-overlay';
import { bottomNavLinks } from '@/lib/navigation';

export function MobileBottomNav() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <MobileSearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around h-16">
          {bottomNavLinks.map((link) => {
            if (link.isSearch) {
              return (
                <button
                  key={link.href}
                  onClick={() => setSearchOpen(true)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors',
                    'text-text-secondary hover:text-text-primary'
                  )}
                >
                  <link.icon className="h-5 w-5" />
<span className="text-[11px] font-medium">{link.label}</span>
                </button>
              );
            }
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                <link.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

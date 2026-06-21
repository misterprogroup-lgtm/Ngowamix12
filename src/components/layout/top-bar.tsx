'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, User, Crown, Settings,
  LogOut, LayoutDashboard, Music, Shield, ChevronDown,
} from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth-store';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { NotificationBell } from '@/components/layout/notification-bell';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 gap-4">
        {/* Navigation arrows + Search */}
        <div className="flex items-center gap-3 flex-1">
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => router.back()}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-hover text-text-secondary hover:text-text-primary transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => router.forward()}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-hover text-text-secondary hover:text-text-primary transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <Input
              type="search"
              placeholder="Que voulez-vous écouter ?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 rounded-full bg-surface-hover border-none pl-4 text-sm focus-visible:ring-1 focus-visible:ring-primary placeholder:text-text-muted"
            />
          </form>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-2">
            <NotificationBell />
            <ThemeToggle />
          </div>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-full bg-surface-hover hover:bg-surface transition-colors"
              >
                <div className="relative h-7 w-7 rounded-full overflow-hidden ring-2 ring-border">
                  {(() => {
                    const avatar = user.artist?.avatar || user.avatar;
                    return avatar ? (
                      <SafeImage src={avatar} alt="" fill sizes="28px" className="object-cover" fallback={<User className="h-4 w-4" />} />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-surface-hover">
                        <User className="h-4 w-4 text-text-secondary" />
                      </div>
                    );
                  })()}
                </div>
                <ChevronDown className={cn('h-4 w-4 text-text-secondary transition-transform', showDropdown && 'rotate-180')} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-background shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                      {user.displayName || user.email}
                      {user.isPremium && <Crown className="h-3.5 w-3.5 text-accent" />}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">{user.email}</p>
                  </div>

                  <Link
                    href={ROUTES.USER_PROFILE}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Compte
                  </Link>

                  {user.role === 'LISTENER' && (
                    <Link
                      href={ROUTES.USER_DASHBOARD}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Tableau de bord
                    </Link>
                  )}

                  {(user.role === 'ARTIST' || user.role === 'LABEL') && (
                    <Link
                      href={ROUTES.ARTIST_DASHBOARD}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                    >
                      <Music className="h-4 w-4" />
                      Espace artiste
                    </Link>
                  )}

                  {user.role === 'ADMIN' && (
                    <Link
                      href={ROUTES.ADMIN_DASHBOARD}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                    >
                      <Shield className="h-4 w-4" />
                      Administration
                    </Link>
                  )}

                  {!user.isPremium && (
                    <Link
                      href={ROUTES.PREMIUM}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-accent hover:bg-surface transition-colors border-t border-border mt-1"
                    >
                      <Crown className="h-4 w-4" />
                      Passer au Premium
                    </Link>
                  )}

                  <div className="border-t border-border my-1" />

                  <button
                    onClick={() => { setShowDropdown(false); logout(); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-surface transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm" className="rounded-full">
                  Connexion
                </Button>
              </Link>
              <Link href={ROUTES.REGISTER}>
                <Button variant="primary" size="sm" className="rounded-full">
                  S'inscrire
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

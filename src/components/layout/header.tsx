'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, Shield, LayoutDashboard, Crown, LogOut, Settings, ChevronDown, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth-store';
import { ROUTES, APP_NAME } from '@/lib/constants';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();
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

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
  };

  const navLinks = [
    { href: ROUTES.HOME, label: 'Accueil' },
    { href: ROUTES.EXPLORE, label: 'Explorer' },
    { href: ROUTES.TICKETS, label: 'Tickets', icon: Ticket },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const adminLinks = [
    { href: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard' },
    { href: ROUTES.ADMIN_USERS, label: 'Utilisateurs' },
    { href: ROUTES.ADMIN_CATALOG, label: 'Catalogue' },
    { href: '/admin/verification', label: 'Vérifications' },
    { href: ROUTES.ADMIN_TRANSACTIONS, label: 'Transactions' },
  ];

  const artistLinks = [
    { href: ROUTES.ARTIST_DASHBOARD, label: 'Dashboard' },
    { href: ROUTES.ARTIST_CATALOG, label: 'Catalogue' },
    { href: ROUTES.ARTIST_PROFILE, label: 'Profil' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center gap-4">
          <Link href={ROUTES.HOME} className="flex items-center gap-2 shrink-0">
            <Image src="/logo-icon.png" alt="Ngowamix" width={32} height={32} className="h-8 w-8" />
            <span className="text-lg font-bold text-text-primary hidden sm:inline">
              {APP_NAME}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors rounded-md flex items-center gap-1.5',
                  pathname === link.href && 'text-text-primary bg-surface'
                )}
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                {link.label}
              </Link>
            ))}
            {user?.role === 'ADMIN' && (
              <div className="flex items-center gap-1 ml-2 border-l border-border pl-2">
                <Shield className="h-4 w-4 text-primary mr-1" />
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-2 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors rounded-md',
                      pathname === link.href && 'text-text-primary bg-surface'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
            {(user?.role === 'ARTIST' || user?.role === 'LABEL') && (
              <div className="flex items-center gap-1 ml-2 border-l border-border pl-2">
                <LayoutDashboard className="h-4 w-4 text-accent mr-1" />
                {artistLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-2 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors rounded-md',
                      pathname === link.href && 'text-text-primary bg-surface'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </nav>

          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto">
            <Input
              type="search"
              placeholder="Rechercher artistes, albums, titres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="h-10"
            />
          </form>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface transition-colors"
                >
                  {user.isPremium && (
                    <Crown className="h-4 w-4 text-accent" />
                  )}
                  <User className="h-5 w-5" />
                  <ChevronDown className={cn('h-4 w-4 text-text-secondary transition-transform', showDropdown && 'rotate-180')} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-background shadow-lg py-1 z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-text-primary">{user.displayName || user.email}</p>
                      <p className="text-xs text-text-muted mt-0.5">{user.email}</p>
                    </div>

                    <Link
                      href={ROUTES.USER_PROFILE}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Mon profil
                    </Link>

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

                    {(user.role === 'ARTIST' || user.role === 'LABEL') && (
                      <Link
                        href={ROUTES.ARTIST_DASHBOARD}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard artiste
                      </Link>
                    )}

                    {user.role === 'LISTENER' && (
                      <Link
                        href={ROUTES.USER_DASHBOARD}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Mon tableau de bord
                      </Link>
                    )}

                    <div className="border-t border-border my-1" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-surface transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    Connexion
                  </Button>
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <Button variant="primary" size="sm">
                    S&apos;inscrire
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

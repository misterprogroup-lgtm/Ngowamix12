'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, Shield, LayoutDashboard, Crown, LogOut, Settings, ChevronDown, Ticket, Menu, X, Home, Compass, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth-store';
import { ROUTES, APP_NAME } from '@/lib/constants';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { NotificationBell } from '@/components/layout/notification-bell';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
    { href: ROUTES.ADMIN_SCANNER, label: 'Scanner' },
    { href: ROUTES.ADMIN_TRANSACTIONS, label: 'Transactions' },
    { href: ROUTES.ADMIN_SETTINGS, label: 'Paramètres' },
    { href: ROUTES.ADMIN_PROMO_CODES, label: 'Codes Promo' },
  ];

  const artistLinks = [
    { href: ROUTES.ARTIST_DASHBOARD, label: 'Dashboard' },
    { href: ROUTES.ARTIST_CATALOG, label: 'Catalogue' },
    { href: ROUTES.ARTIST_PROFILE, label: 'Profil' },
    { href: ROUTES.ARTIST_REFERRAL, label: 'Parrainage' },
  ];

  return (
    <>
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

          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-md mx-auto">
            <Input
              type="search"
              placeholder="Rechercher artistes, albums, titres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="h-10"
            />
          </form>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            {user && <NotificationBell />}
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
      {/* Fixed hamburger top-left on mobile */}
      <button
        onClick={() => setShowMobileMenu(true)}
        className="md:hidden fixed top-3 right-3 z-[55] p-2.5 text-text-secondary hover:text-text-primary transition-colors"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-background border-l border-border shadow-xl flex flex-col animate-slideRight">
            <div className="flex items-center justify-between px-4 h-16 border-b border-border">
              <span className="font-bold text-text-primary">Menu</span>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {/* Theme toggle */}
              <div className="px-3 mb-2">
                {user && <NotificationBell />}
                <ThemeToggle />
              </div>

              {/* Main links */}
              <div className="px-3 space-y-0.5">
                <Link
                  href={ROUTES.HOME}
                  onClick={() => setShowMobileMenu(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname === '/' ? 'text-primary bg-primary/5' : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  )}
                >
                  <Home className="h-4 w-4" />
                  Accueil
                </Link>
                <Link
                  href={ROUTES.EXPLORE}
                  onClick={() => setShowMobileMenu(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith('/explore') ? 'text-primary bg-primary/5' : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  )}
                >
                  <Compass className="h-4 w-4" />
                  Explorer
                </Link>
                <Link
                  href={ROUTES.MY_PLAYLIST}
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                >
                  <Headphones className="h-4 w-4" />
                  Ma playlist
                </Link>
                <Link
                  href={ROUTES.TICKETS}
                  onClick={() => setShowMobileMenu(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith('/tickets') ? 'text-primary bg-primary/5' : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  )}
                >
                  <Ticket className="h-4 w-4" />
                  Tickets
                </Link>
                <Link
                  href={ROUTES.PREMIUM}
                  onClick={() => setShowMobileMenu(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith('/premium') ? 'text-primary bg-primary/5' : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  )}
                >
                  <Crown className="h-4 w-4" />
                  Premium
                </Link>
              </div>

              {/* User section */}
              <div className="border-t border-border my-3 mx-3" />

              {user ? (
                <div className="px-3 space-y-0.5">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-text-primary truncate">{user.displayName || user.email}</p>
                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                  </div>

                  <Link
                    href={ROUTES.USER_PROFILE}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Mon profil
                  </Link>

                  {user.role === 'ADMIN' && (
                    <>
                      <div className="px-3 py-1">
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Admin</p>
                      </div>
                      {adminLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setShowMobileMenu(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                            pathname === link.href
                              ? 'text-primary bg-primary/5'
                              : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                          )}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </>
                  )}

                  {(user.role === 'ARTIST' || user.role === 'LABEL') && (
                    <Link
                      href={ROUTES.ARTIST_DASHBOARD}
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard artiste
                    </Link>
                  )}

                  {user.role === 'LISTENER' && (
                    <Link
                      href={ROUTES.USER_DASHBOARD}
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Mon tableau de bord
                    </Link>
                  )}

                  <div className="border-t border-border my-2" />

                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-surface transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Se déconnecter
                  </button>
                </div>
              ) : (
                <div className="px-3 space-y-2">
                  <Link
                    href={ROUTES.LOGIN}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    href={ROUTES.REGISTER}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                  >
                    S&apos;inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SafeImage } from '@/components/ui/safe-image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, Shield, LayoutDashboard, Crown, LogOut, Settings, ChevronDown, Ticket, Menu, X, Home, Compass, Headphones, Podcast, ChevronRight, Megaphone, ListMusic } from 'lucide-react';
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
  const [mobileAdminOpen, setMobileAdminOpen] = useState(false);
  const [mobileArtistOpen, setMobileArtistOpen] = useState(false);
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
    { href: ROUTES.ADMIN_ADS, label: 'Publicités' },
    { href: ROUTES.ADMIN_ALBUM_COVERS, label: 'Pochettes album' },
  ];

  const artistLinks = [
    { href: ROUTES.ARTIST_DASHBOARD, label: 'Dashboard' },
    { href: ROUTES.ARTIST_CATALOG, label: 'Catalogue' },
    { href: ROUTES.ARTIST_PROFILE, label: 'Profil' },
    { href: ROUTES.ARTIST_LIVESTREAM, label: 'Live' },
    { href: ROUTES.ARTIST_ROYALTIES, label: 'Royalties' },
    { href: ROUTES.ARTIST_SERVICES, label: 'Services' },
    { href: ROUTES.ARTIST_REFERRAL, label: 'Parrainage' },
  ];

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center gap-4">
          <Link href={ROUTES.HOME} className="flex items-center gap-2 shrink-0">
            <Image src="/logo-icon.png" alt="Ngowamix" width={32} height={32} className="h-8 w-8" />
            <span className="text-lg font-bold text-text-primary hidden sm:inline">
              {APP_NAME}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 ml-2">
            {user?.role === 'ADMIN' && (
              <div className="flex items-center gap-1 border border-border rounded-lg px-2 py-1">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-text-secondary">Admin</span>
              </div>
            )}
            {(user?.role === 'ARTIST' || user?.role === 'LABEL') && (
              <div className="flex items-center gap-1 border border-border rounded-lg px-2 py-1">
                <LayoutDashboard className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs font-medium text-text-secondary">Artiste</span>
              </div>
            )}
          </div>

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
                  {(() => {
                    const avatar = user.artist?.avatar || user.avatar;
                    return avatar ? (
                      <SafeImage src={avatar} alt="" width={28} height={28} unoptimized className="h-7 w-7 rounded-full object-cover ring-2 ring-border" fallback={<div className="h-7 w-7 rounded-full bg-surface-hover flex items-center justify-center"><User className="h-4 w-4 text-text-secondary" /></div>} />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-surface-hover flex items-center justify-center">
                        <User className="h-4 w-4 text-text-secondary" />
                      </div>
                    );
                  })()}
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
                      <div className="border-b border-border pb-1 mb-1">
                        <p className="px-4 py-1 text-xs font-semibold text-text-muted uppercase tracking-wider">Admin</p>
                        {adminLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    )}

                    {(user.role === 'ARTIST' || user.role === 'LABEL') && (
                      <div className="border-b border-border pb-1 mb-1">
                        <p className="px-4 py-1 text-xs font-semibold text-text-muted uppercase tracking-wider">Artiste</p>
                        {artistLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
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
        className="md:hidden fixed top-3 right-3 z-55 p-2.5 text-text-secondary hover:text-text-primary transition-colors"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-60">
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
                  href={ROUTES.PLAYLISTS}
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                >
                  <ListMusic className="h-4 w-4" />
                  Playlists
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
                  href={ROUTES.PODCASTS}
                  onClick={() => setShowMobileMenu(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith('/podcasts') ? 'text-primary bg-primary/5' : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  )}
                >
                  <Podcast className="h-4 w-4" />
                  Podcasts
                </Link>
                <Link
                  href={ROUTES.LIVESTREAMS}
                  onClick={() => setShowMobileMenu(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith('/livestream') ? 'text-primary bg-primary/5' : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  )}
                >
                  <span className="relative flex h-4 w-4 items-center justify-center">
                    <span className="absolute h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  </span>
                  En direct
                </Link>
                <Link
                  href={ROUTES.CHAT}
                  onClick={() => setShowMobileMenu(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith('/chat') ? 'text-primary bg-primary/5' : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  )}
                >
                  <Headphones className="h-4 w-4" />
                  Chat
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
                    <div className="space-y-0.5">
                      <button
                        onClick={() => setMobileAdminOpen(!mobileAdminOpen)}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-semibold text-text-muted uppercase tracking-wider hover:text-text-primary hover:bg-surface transition-colors"
                      >
                        <span>Menu du Dashboard</span>
                        {mobileAdminOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </button>
                      {mobileAdminOpen && adminLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setShowMobileMenu(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ml-2',
                            pathname === link.href
                              ? 'text-primary bg-primary/5'
                              : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                          )}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}

                  {(user.role === 'ARTIST' || user.role === 'LABEL') && (
                    <div className="space-y-0.5">
                      <button
                        onClick={() => setMobileArtistOpen(!mobileArtistOpen)}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-semibold text-text-muted uppercase tracking-wider hover:text-text-primary hover:bg-surface transition-colors"
                      >
                        <span>Menu du Dashboard</span>
                        {mobileArtistOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </button>
                      {mobileArtistOpen && artistLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setShowMobileMenu(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ml-2',
                            pathname === link.href
                              ? 'text-primary bg-primary/5'
                              : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                          )}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
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

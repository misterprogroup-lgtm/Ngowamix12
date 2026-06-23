'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SafeImage } from '@/components/ui/safe-image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, Shield, LayoutDashboard, Crown, LogOut, Settings, ChevronDown, Ticket, Menu, X, Home, Compass, Headphones, Podcast, ChevronRight, Megaphone, ListMusic, Upload } from 'lucide-react';
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
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0b0b0b]/90 backdrop-blur-md border-b border-[#ffffff08]">
        <div className="flex items-center h-full px-4 md:px-6 gap-4">
          <Link href={ROUTES.HOME} className="flex items-center gap-2 shrink-0">
            <Image src="/logo-icon.png" alt={APP_NAME} width={32} height={32} className="h-8 w-8" />
          </Link>

          <Button variant="secondary" size="sm" className="hidden sm:inline-flex gap-1.5 rounded-full border-[#ff990033] text-[#ff9900] text-xs font-semibold px-3 py-1.5 h-auto">
            <Crown className="h-3.5 w-3.5" />
            Get Plus +
          </Button>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
              <input
                type="search"
                placeholder="Search for artists, songs, albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-full border border-[#ffffff15] bg-[#141414] text-sm text-white placeholder:text-[#666] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900] transition-colors"
              />
            </div>
          </form>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <NotificationBell />
                <ThemeToggle />
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#ffffff0a] transition-colors"
                  >
                    {user.isPremium && (
                      <Crown className="h-4 w-4 text-[#ff9900]" />
                    )}
                    {(() => {
                      const avatar = user.artist?.avatar || user.avatar;
                      return avatar ? (
                        <SafeImage src={avatar} alt="" width={28} height={28} unoptimized className="h-7 w-7 rounded-full object-cover ring-2 ring-[#ffffff15]" fallback={<div className="h-7 w-7 rounded-full bg-[#1f1f1f] flex items-center justify-center"><User className="h-4 w-4 text-[#666]" /></div>} />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-[#1f1f1f] flex items-center justify-center">
                          <User className="h-4 w-4 text-[#666]" />
                        </div>
                      );
                    })()}
                    <ChevronDown className={cn('h-4 w-4 text-[#666] transition-transform', showDropdown && 'rotate-180')} />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#ffffff15] bg-[#141414] shadow-lg py-1 z-50">
                      <div className="px-4 py-3 border-b border-[#ffffff0a]">
                        <p className="text-sm font-medium text-white">{user.displayName || user.email}</p>
                        <p className="text-xs text-[#999] mt-0.5">{user.email}</p>
                      </div>

                      <Link
                        href={ROUTES.USER_PROFILE}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#999] hover:text-white hover:bg-[#ffffff0a] transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Mon profil
                      </Link>

                      {user.role === 'ADMIN' && (
                        <div className="border-b border-[#ffffff0a] pb-1 mb-1">
                          <p className="px-4 py-1 text-xs font-semibold text-[#666] uppercase tracking-wider">Admin</p>
                          {adminLinks.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setShowDropdown(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-[#999] hover:text-white hover:bg-[#ffffff0a] transition-colors"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      )}

                      {(user.role === 'ARTIST' || user.role === 'LABEL') && (
                        <div className="border-b border-[#ffffff0a] pb-1 mb-1">
                          <p className="px-4 py-1 text-xs font-semibold text-[#666] uppercase tracking-wider">Artiste</p>
                          {artistLinks.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setShowDropdown(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-[#999] hover:text-white hover:bg-[#ffffff0a] transition-colors"
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
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#999] hover:text-white hover:bg-[#ffffff0a] transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Mon tableau de bord
                        </Link>
                      )}

                      <div className="border-t border-[#ffffff0a] my-1" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-[#ffffff0a] transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm" className="text-white hover:text-[#ff9900]">
                    Sign In
                  </Button>
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <Button variant="primary" size="sm" className="rounded-full">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            <Link href="/upload">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-[#ff9900] hover:text-white hover:bg-[#ff9900] rounded-full border border-[#ff990033] hover:border-[#ff9900] transition-all">
                <Upload className="h-4 w-4" />
                UPLOAD
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <button
        onClick={() => setShowMobileMenu(true)}
        className="md:hidden fixed top-3 right-3 z-55 p-2.5 text-[#999] hover:text-white transition-colors"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-60">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#0b0b0b] border-l border-[#ffffff0a] shadow-xl flex flex-col animate-slideRight">
            <div className="flex items-center justify-between px-4 h-16 border-b border-[#ffffff0a]">
              <span className="font-bold text-white">Menu</span>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 text-[#999] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              <div className="px-3 mb-2 flex items-center gap-2">
                {user && <NotificationBell />}
                <ThemeToggle />
              </div>

              <div className="px-3 space-y-0.5">
                <Link
                  href={ROUTES.HOME}
                  onClick={() => setShowMobileMenu(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname === '/' ? 'text-[#ff9900] bg-[#ff990011]' : 'text-[#999] hover:text-white hover:bg-[#ffffff0a]'
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
                    pathname.startsWith('/explore') ? 'text-[#ff9900] bg-[#ff990011]' : 'text-[#999] hover:text-white hover:bg-[#ffffff0a]'
                  )}
                >
                  <Compass className="h-4 w-4" />
                  Explorer
                </Link>
                <Link
                  href={ROUTES.MY_PLAYLIST}
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#999] hover:text-white hover:bg-[#ffffff0a] transition-colors"
                >
                  <Headphones className="h-4 w-4" />
                  Ma playlist
                </Link>
                <Link
                  href={ROUTES.PLAYLISTS}
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#999] hover:text-white hover:bg-[#ffffff0a] transition-colors"
                >
                  <ListMusic className="h-4 w-4" />
                  Playlists
                </Link>
                <Link
                  href={ROUTES.TICKETS}
                  onClick={() => setShowMobileMenu(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname.startsWith('/tickets') ? 'text-[#ff9900] bg-[#ff990011]' : 'text-[#999] hover:text-white hover:bg-[#ffffff0a]'
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
                    pathname.startsWith('/podcasts') ? 'text-[#ff9900] bg-[#ff990011]' : 'text-[#999] hover:text-white hover:bg-[#ffffff0a]'
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
                    pathname.startsWith('/livestream') ? 'text-[#ff9900] bg-[#ff990011]' : 'text-[#999] hover:text-white hover:bg-[#ffffff0a]'
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
                    pathname.startsWith('/chat') ? 'text-[#ff9900] bg-[#ff990011]' : 'text-[#999] hover:text-white hover:bg-[#ffffff0a]'
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
                    pathname.startsWith('/premium') ? 'text-[#ff9900] bg-[#ff990011]' : 'text-[#999] hover:text-white hover:bg-[#ffffff0a]'
                  )}
                >
                  <Crown className="h-4 w-4" />
                  Premium
                </Link>
              </div>

              <div className="border-t border-[#ffffff0a] my-3 mx-3" />

              {user ? (
                <div className="px-3 space-y-0.5">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-white truncate">{user.displayName || user.email}</p>
                    <p className="text-xs text-[#999] truncate">{user.email}</p>
                  </div>

                  <Link
                    href={ROUTES.USER_PROFILE}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#999] hover:text-white hover:bg-[#ffffff0a] transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Mon profil
                  </Link>

                  {user.role === 'ADMIN' && (
                    <div className="space-y-0.5">
                      <button
                        onClick={() => setMobileAdminOpen(!mobileAdminOpen)}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-semibold text-[#666] uppercase tracking-wider hover:text-white hover:bg-[#ffffff0a] transition-colors"
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
                              ? 'text-[#ff9900] bg-[#ff990011]'
                              : 'text-[#999] hover:text-white hover:bg-[#ffffff0a]'
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
                        className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-semibold text-[#666] uppercase tracking-wider hover:text-white hover:bg-[#ffffff0a] transition-colors"
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
                              ? 'text-[#ff9900] bg-[#ff990011]'
                              : 'text-[#999] hover:text-white hover:bg-[#ffffff0a]'
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
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#999] hover:text-white hover:bg-[#ffffff0a] transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Mon tableau de bord
                    </Link>
                  )}

                  <div className="border-t border-[#ffffff0a] my-2" />

                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-[#ffffff0a] transition-colors"
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
                    className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-[#ff9900] text-white text-sm font-medium hover:bg-[#e68a00] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href={ROUTES.REGISTER}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg border border-[#ffffff15] text-sm font-medium text-[#999] hover:text-white hover:bg-[#ffffff0a] transition-colors"
                  >
                    Sign Up
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

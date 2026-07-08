'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SafeImage } from '@/components/ui/safe-image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search, User, LayoutDashboard, Crown, LogOut, Settings,
  ChevronDown, Ticket, Menu, X, Home, Compass, Headphones,
  Podcast, ChevronRight, ListMusic, Upload, Mic2, Disc3,
  Music, ShieldCheck, TrendingUp, DollarSign, Users, Gift,
  Radio, Palette, QrCode, MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { ROUTES, APP_NAME } from '@/lib/constants';

import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
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

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const adminLinks = [
    { href: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { href: ROUTES.ADMIN_USERS, label: 'Utilisateurs', icon: Users },
    { href: ROUTES.ADMIN_CATALOG, label: 'Catalogue', icon: Music },
    { href: '/admin/verification', label: 'Vérifications', icon: ShieldCheck },
    { href: ROUTES.ADMIN_SCANNER, label: 'Scanner', icon: QrCode },
    { href: ROUTES.ADMIN_TRANSACTIONS, label: 'Transactions', icon: DollarSign },
    { href: ROUTES.ADMIN_SETTINGS, label: 'Paramètres', icon: Settings },
    { href: ROUTES.ADMIN_PROMO_CODES, label: 'Codes Promo', icon: Gift },
    { href: ROUTES.ADMIN_ADS, label: 'Publicités', icon: Radio },
    { href: ROUTES.ADMIN_ALBUM_COVERS, label: 'Pochettes album', icon: Palette },
  ];

  const artistLinks = [
    { href: ROUTES.ARTIST_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { href: ROUTES.ARTIST_CATALOG, label: 'Catalogue', icon: Disc3 },
    { href: ROUTES.ARTIST_PROFILE, label: 'Profil', icon: User },
    { href: ROUTES.ARTIST_LIVESTREAM, label: 'Live', icon: Radio },
    { href: ROUTES.ARTIST_ROYALTIES, label: 'Royalties', icon: TrendingUp },
    { href: ROUTES.ARTIST_SERVICES, label: 'Services', icon: Mic2 },
    { href: ROUTES.ARTIST_REFERRAL, label: 'Parrainage', icon: Gift },
  ];

  const mainNav = [
    { href: ROUTES.HOME, label: 'Accueil', icon: Home },
    { href: ROUTES.EXPLORE, label: 'Explorer', icon: Compass },
    { href: ROUTES.PLAYLISTS, label: 'Playlists', icon: ListMusic },
    { href: ROUTES.FEED, label: "Fil d'actu", icon: MessageSquare },
    { href: ROUTES.USER_LIBRARY, label: 'Ma Bibliothèque', icon: Headphones },
  ];

  const discoverNav = [
    { href: ROUTES.PREMIUM, label: 'Premium', icon: Crown },
    { href: ROUTES.PODCASTS, label: 'Podcasts', icon: Podcast },
    { href: ROUTES.LIVESTREAMS, label: 'En direct', icon: Radio, badge: true },
    { href: ROUTES.CHAT, label: 'Chat', icon: MessageSquare },
    { href: ROUTES.TICKETS, label: 'Tickets', icon: Ticket },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0b0b0b]/90 backdrop-blur-md border-b border-[#ffffff08]">
        <div className="flex items-center h-full px-4 md:px-6 gap-3">
          <Link href={ROUTES.HOME} className="flex items-center gap-2.5 shrink-0 mr-1">
            <span className="text-base font-black text-white tracking-tight">
              {APP_NAME}
            </span>
            <Image src="/logo-icon.png" alt={APP_NAME} width={32} height={32} className="h-8 w-8" />
          </Link>

          <Link
            href={ROUTES.PREMIUM}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-[11px] font-bold px-3 py-1.5 h-auto hover:bg-primary/15 transition-colors"
          >
            <Crown className="h-3 w-3" />
            Premium
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto max-sm:hidden">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555]" />
              <input
                type="search"
                placeholder="Rechercher artistes, titres, albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-full border border-[#ffffff12] bg-[#141414] text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </form>

          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            {user ? (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-lg hover:bg-[#ffffff0a] transition-colors"
                  >
                    {user.isPremium && (
                      <Crown className="h-3.5 w-3.5 text-primary" />
                    )}
                    {(() => {
                      const avatar = user.artist?.avatar || user.avatar;
                      return avatar ? (
                        <SafeImage src={avatar} alt="" width={26} height={26} unoptimized className="h-[26px] w-[26px] rounded-full object-cover ring-2 ring-[#ffffff15]" fallback={<div className="h-[26px] w-[26px] rounded-full bg-[#1f1f1f] flex items-center justify-center"><User className="h-3.5 w-3.5 text-[#666]" /></div>} />
                      ) : (
                        <div className="h-[26px] w-[26px] rounded-full bg-[#1f1f1f] flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-[#666]" />
                        </div>
                      );
                    })()}
                    <span className="max-w-[100px] truncate text-sm font-medium text-white hidden lg:block">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className={cn('h-3.5 w-3.5 text-[#555] transition-transform shrink-0', showDropdown && 'rotate-180')} />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#ffffff15] bg-[#141414] shadow-xl py-2 z-50">
                      <div className="px-4 py-3 border-b border-[#ffffff0a]">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const avatar = user.artist?.avatar || user.avatar;
                            return avatar ? (
                              <SafeImage src={avatar} alt="" width={40} height={40} unoptimized className="h-10 w-10 rounded-full object-cover ring-2 ring-[#ffffff15]" fallback={<div className="h-10 w-10 rounded-full bg-[#1f1f1f]" />} />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-[#1f1f1f] flex items-center justify-center">
                                <User className="h-5 w-5 text-[#666]" />
                              </div>
                            );
                          })()}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                              {user.displayName || user.email?.split('@')[0]}
                              {user.isPremium && <Crown className="h-3.5 w-3.5 text-primary shrink-0" />}
                            </p>
                            <p className="text-xs text-[#777] truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={ROUTES.USER_PROFILE}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#999] hover:text-white hover:bg-[#ffffff0a] transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Mon profil
                      </Link>

                      {user.role === 'ADMIN' && (
                        <div className="border-t border-[#ffffff0a] pt-1 mt-1">
                          <p className="px-4 py-1 text-[10px] font-bold text-[#555] uppercase tracking-widest">Administration</p>
                          {adminLinks.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setShowDropdown(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-[#999] hover:text-white hover:bg-[#ffffff0a] transition-colors"
                            >
                              <link.icon className="h-4 w-4" />
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      )}

                      {(user.role === 'ARTIST' || user.role === 'LABEL') && (
                        <div className="border-t border-[#ffffff0a] pt-1 mt-1">
                          <p className="px-4 py-1 text-[10px] font-bold text-[#555] uppercase tracking-widest">Espace Artiste</p>
                          {artistLinks.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setShowDropdown(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-[#999] hover:text-white hover:bg-[#ffffff0a] transition-colors"
                            >
                              <link.icon className="h-4 w-4" />
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      )}

                      {user.role === 'LISTENER' && (
                        <div className="border-t border-[#ffffff0a] mt-1">
                          <Link
                            href={ROUTES.USER_DASHBOARD}
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#999] hover:text-white hover:bg-[#ffffff0a] transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Mon tableau de bord
                          </Link>
                        </div>
                      )}

                      <div className="border-t border-[#ffffff0a] mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-[#ffffff0a] transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Se déconnecter
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <Link href="/artist/upload">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-primary hover:text-white hover:bg-primary rounded-full border border-primary/20 hover:border-primary transition-all text-xs font-bold px-3.5">
                    <Upload className="h-3.5 w-3.5" />
                    UPLOADER
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm" className="text-[#ccc] hover:text-white text-sm">
                    Connexion
                  </Button>
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <Button variant="primary" size="sm" className="rounded-full text-sm px-5">
                    Inscription
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <button
        onClick={() => setShowMobileMenu(true)}
        className="md:hidden fixed top-3 right-3 z-55 p-2 text-[#999] hover:text-white transition-colors"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-60">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#0b0b0b] border-l border-[#ffffff0a] shadow-2xl flex flex-col animate-slideRight">
            <div className="flex items-center justify-between px-5 h-16 border-b border-[#ffffff0a]">
              <div className="flex items-center gap-2.5">
                <Image src="/logo-icon.png" alt={APP_NAME} width={28} height={28} className="h-7 w-7" />
                <span className="font-bold text-white text-base">{APP_NAME}</span>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 text-[#999] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3">
              {user && (
                <div className="px-3 mb-4" />
              )}

              <div className="space-y-0.5">
                <p className="px-3 py-1 text-[10px] font-bold text-[#555] uppercase tracking-widest">Navigation</p>
                {mainNav.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive(link.href) ? 'text-primary bg-primary/10' : 'text-[#999] hover:text-white hover:bg-[#ffffff0a]'
                    )}
                  >
                    <link.icon className={cn('h-4 w-4', isActive(link.href) && 'text-primary')} />
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-[#ffffff0a] my-3 mx-3" />

              <div className="space-y-0.5">
                <p className="px-3 py-1 text-[10px] font-bold text-[#555] uppercase tracking-widest">Découvrir</p>
                {discoverNav.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive(link.href) ? 'text-primary bg-primary/10' : 'text-[#999] hover:text-white hover:bg-[#ffffff0a]'
                    )}
                  >
                    {link.badge ? (
                      <span className="relative flex h-4 w-4 items-center justify-center">
                        <link.icon className="h-4 w-4" />
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      </span>
                    ) : (
                      <link.icon className="h-4 w-4" />
                    )}
                    {link.label}
                  </Link>
                ))}
              </div>

              {user && (
                <>
                  <div className="border-t border-[#ffffff0a] my-3 mx-3" />

                  <div className="space-y-0.5">
                    <p className="px-3 py-1 text-[10px] font-bold text-[#555] uppercase tracking-widest">Compte</p>
                    <Link
                      href={ROUTES.USER_PROFILE}
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#999] hover:text-white hover:bg-[#ffffff0a] transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Mon profil
                    </Link>

                    {user.role === 'ADMIN' && (
                      <>
                        <button
                          onClick={() => setMobileSection(mobileSection === 'admin' ? null : 'admin')}
                          className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-[#666] uppercase tracking-wider hover:text-white hover:bg-[#ffffff0a] transition-colors"
                        >
                          <span>Administration</span>
                          <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', mobileSection === 'admin' && 'rotate-90')} />
                        </button>
                        {mobileSection === 'admin' && adminLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setShowMobileMenu(false)}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ml-4',
                              pathname === link.href ? 'text-primary bg-primary/10' : 'text-[#999] hover:text-white hover:bg-[#ffffff0a]'
                            )}
                          >
                            <link.icon className="h-4 w-4" />
                            {link.label}
                          </Link>
                        ))}
                      </>
                    )}

                    {(user.role === 'ARTIST' || user.role === 'LABEL') && (
                      <>
                        <button
                          onClick={() => setMobileSection(mobileSection === 'artist' ? null : 'artist')}
                          className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-[#666] uppercase tracking-wider hover:text-white hover:bg-[#ffffff0a] transition-colors"
                        >
                          <span>Espace Artiste</span>
                          <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', mobileSection === 'artist' && 'rotate-90')} />
                        </button>
                        {mobileSection === 'artist' && artistLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setShowMobileMenu(false)}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ml-4',
                              pathname === link.href ? 'text-primary bg-primary/10' : 'text-[#999] hover:text-white hover:bg-[#ffffff0a]'
                            )}
                          >
                            <link.icon className="h-4 w-4" />
                            {link.label}
                          </Link>
                        ))}
                      </>
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

                    <div className="border-t border-[#ffffff0a] my-2 mx-3" />

                    <button
                      onClick={() => { setShowMobileMenu(false); handleLogout(); }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-[#ffffff0a] transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Se déconnecter
                    </button>
                  </div>
                </>
              )}

              {!user && (
                <div className="border-t border-[#ffffff0a] my-3 mx-3 pt-3 space-y-2">
                  <Link
                    href={ROUTES.LOGIN}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center justify-center w-full px-4 py-3 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    href={ROUTES.REGISTER}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center justify-center w-full px-4 py-3 rounded-lg border border-[#ffffff15] text-sm font-medium text-[#999] hover:text-white hover:bg-[#ffffff0a] transition-colors"
                  >
                    Inscription
                  </Link>
                </div>
              )}

              <Link
                href="/artist/upload"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center justify-center gap-2 mx-3 mt-3 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
              >
                <Upload className="h-4 w-4" />
                UPLOADER VOTRE MUSIQUE
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

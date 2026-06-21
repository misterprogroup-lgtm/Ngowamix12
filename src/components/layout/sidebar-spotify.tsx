'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home, Search, Library, Plus, ListMusic, Heart,
  Download, Crown, Globe, ChevronDown, ChevronRight,
  User, LogOut, Settings, BadgeCheck, Music,
  LayoutDashboard, Ticket, Podcast, MessageSquare, Repeat2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { ROUTES, APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { cn } from '@/lib/utils';

const mainNav = [
  { href: ROUTES.HOME, label: 'Accueil', icon: Home },
  { href: ROUTES.SEARCH, label: 'Rechercher', icon: Search },
];

const libraryLinks = [
  { href: ROUTES.MY_PLAYLIST, label: 'Ma playlist', icon: ListMusic },
  { href: ROUTES.PLAYLISTS, label: 'Playlists', icon: Heart },
  { href: ROUTES.OFFLINE, label: 'Téléchargements', icon: Download },
  { href: '/user/library', label: 'Bibliothèque', icon: Library },
];

const exploreLinks = [
  { href: ROUTES.EXPLORE, label: 'Explorer', icon: Globe },
  { href: ROUTES.TICKETS, label: 'Tickets', icon: Ticket },
  { href: ROUTES.PODCASTS, label: 'Podcasts', icon: Podcast },
  { href: ROUTES.MESSAGES, label: 'Messages', icon: MessageSquare },
  { href: ROUTES.FEED, label: "Fil d'actu", icon: Repeat2 },
];

export function SidebarSpotify() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [exploreOpen, setExploreOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 flex-col bg-background z-40 border-r border-border">
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <Image src="/logo-icon.png" alt={APP_NAME} width={32} height={32} className="h-8 w-8" />
          <span className="text-lg font-bold text-text-primary">{APP_NAME}</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 space-y-0.5">
        {mainNav.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive(link.href)
                ? 'text-primary bg-primary/10'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            )}
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Library Section */}
      <div className="mt-2 px-3">
        <button
          onClick={() => setLibraryOpen(!libraryOpen)}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-semibold text-text-muted uppercase tracking-wider hover:text-text-primary hover:bg-surface transition-colors"
        >
          <span className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            Bibliothèque
          </span>
          {libraryOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
        {libraryOpen && (
          <div className="mt-0.5 space-y-0.5 pl-2">
            {libraryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'text-primary bg-primary/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Explore Section */}
      <div className="mt-1 px-3">
        <button
          onClick={() => setExploreOpen(!exploreOpen)}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-semibold text-text-muted uppercase tracking-wider hover:text-text-primary hover:bg-surface transition-colors"
        >
          <span>Découvrir</span>
          {exploreOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
        {exploreOpen && (
          <div className="mt-0.5 space-y-0.5 pl-2">
            {exploreLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'text-primary bg-primary/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Library quick actions */}
      <div className="mt-3 px-3">
        <Link
          href="/playlists"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-hover text-text-muted">
            <Plus className="h-4 w-4" />
          </div>
          Créer une playlist
        </Link>
      </div>

      {/* Spacer */}
      <div className="flex-1 min-h-0" />

      {/* Bottom section */}
      <div className="border-t border-border px-3 py-3 space-y-1">
        {user ? (
          <>
            <div className="px-3 py-2 flex items-center gap-3">
              <div className="relative h-9 w-9 rounded-full bg-surface-hover overflow-hidden shrink-0 ring-2 ring-border">
                {(() => {
                  const avatarUrl = user.artist?.avatar || user.avatar;
                  return avatarUrl ? (
                    <SafeImage src={avatarUrl} alt="" fill sizes="36px" className="object-cover" fallback={<User className="w-full h-full p-1" />} />
                  ) : (
                    <User className="h-4 w-4 text-text-secondary" />
                  );
                })()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary truncate flex items-center gap-1">
                  {user.displayName || user.email}
                  {user.isPremium && <Crown className="h-3 w-3 text-accent shrink-0" />}
                </p>
                <p className="text-xs text-text-muted truncate">{user.email}</p>
              </div>
            </div>

            <Link
              href={ROUTES.USER_PROFILE}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            >
              <Settings className="h-4 w-4" />
              Compte
            </Link>

            {user.role === 'LISTENER' && (
              <Link
                href={ROUTES.USER_DASHBOARD}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Tableau de bord
              </Link>
            )}

            {(user.role === 'ARTIST' || user.role === 'LABEL') && (
              <Link
                href={ROUTES.ARTIST_DASHBOARD}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
              >
                <Music className="h-4 w-4" />
                Espace artiste
              </Link>
            )}

            {user.role === 'ADMIN' && (
              <Link
                href={ROUTES.ADMIN_DASHBOARD}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Administration
              </Link>
            )}

            <div className="border-t border-border my-1" />

            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-surface transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </>
        ) : (
          <div className="space-y-2">
            <Link href={ROUTES.LOGIN}>
              <Button variant="primary" size="sm" className="w-full">
                Connexion
              </Button>
            </Link>
            <Link href={ROUTES.REGISTER}>
              <Button variant="ghost" size="sm" className="w-full">
                S'inscrire
              </Button>
            </Link>
          </div>
        )}

        {/* Premium CTA */}
        {(!user || !user.isPremium) && (
          <Link
            href={ROUTES.PREMIUM}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-accent hover:bg-surface transition-colors mt-1"
          >
            <Crown className="h-4 w-4" />
            Passer au Premium
          </Link>
        )}
      </div>
    </aside>
  );
}

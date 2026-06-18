'use client';

import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home, Compass, Headphones, Ticket, Crown, User, Shield,
  LayoutDashboard, Settings, LogOut, Scan, Tag, Podcast, Megaphone, Image as ImageIcon,
  ListMusic, ChevronDown, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { ROUTES, APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const mainLinks = [
  { href: ROUTES.HOME, label: 'Accueil', icon: Home },
  { href: ROUTES.EXPLORE, label: 'Explorer', icon: Compass },
  { href: ROUTES.MY_PLAYLIST, label: 'Ma playlist', icon: Headphones },
  { href: ROUTES.PLAYLISTS, label: 'Playlists', icon: ListMusic },
  { href: ROUTES.TICKETS, label: 'Tickets', icon: Ticket },
  { href: ROUTES.PODCASTS, label: 'Podcasts', icon: Podcast },
  { href: ROUTES.PREMIUM, label: 'Premium', icon: Crown },
];

const adminLinks = [
  { href: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.ADMIN_USERS, label: 'Utilisateurs', icon: User },
  { href: ROUTES.ADMIN_CATALOG, label: 'Catalogue', icon: LayoutDashboard },
  { href: '/admin/verification', label: 'Vérifications', icon: Shield },
  { href: ROUTES.ADMIN_TRANSACTIONS, label: 'Transactions', icon: LayoutDashboard },
  { href: ROUTES.ADMIN_SCANNER, label: 'Scanner', icon: Scan },
  { href: ROUTES.ADMIN_PROMO_CODES, label: 'Codes Promo', icon: Tag },
  { href: ROUTES.ADMIN_ADS, label: 'Publicités', icon: Megaphone },
  { href: ROUTES.ADMIN_ALBUM_COVERS, label: 'Pochettes', icon: ImageIcon },
  { href: ROUTES.ADMIN_SETTINGS, label: 'Paramètres', icon: Settings },
];

const artistLinks = [
  { href: ROUTES.ARTIST_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.ARTIST_CATALOG, label: 'Catalogue', icon: LayoutDashboard },
  { href: ROUTES.ARTIST_PROFILE, label: 'Profil', icon: User },
  { href: ROUTES.ARTIST_SERVICES, label: 'Services', icon: Settings },
  { href: ROUTES.ARTIST_REFERRAL, label: 'Parrainage', icon: LayoutDashboard },
];

const labelLinks = [
  { href: '/label/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

function DropdownSection({
  label,
  links,
  isActive,
  defaultOpen,
}: {
  label: string;
  links: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
  isActive: (href: string) => boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-semibold text-text-muted uppercase tracking-wider hover:text-text-primary hover:bg-surface transition-colors"
      >
        <span>{label}</span>
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>
      {open && links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ml-2',
            isActive(link.href)
              ? 'text-primary bg-primary/5'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface'
          )}
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const anyAdminActive = adminLinks.some((l) => isActive(l.href));
  const anyArtistActive = artistLinks.some((l) => isActive(l.href));

  return (
    <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-60 flex-col border-r border-border bg-background z-40">
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {mainLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive(link.href)
                ? 'text-primary bg-primary/5'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </div>

      <div className="border-t border-border px-3 py-4">
        {user ? (
          <div className="space-y-1">
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
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user.displayName || user.email}
                </p>
                {user.isPremium && (
                  <p className="text-xs text-accent flex items-center gap-1 mt-0.5">
                    <Crown className="h-3 w-3" /> Premium
                  </p>
                )}
              </div>
            </div>

            <Link
              href={ROUTES.USER_PROFILE}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            >
              <Settings className="h-4 w-4" />
              Mon profil
            </Link>

            <Link
              href={ROUTES.USER_PODCASTS}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            >
              <Podcast className="h-4 w-4" />
              Mes podcasts
            </Link>

            {user.role === 'ADMIN' && (
              <DropdownSection
                label="Menu du Dashboard"
                links={adminLinks}
                isActive={isActive}
                defaultOpen={anyAdminActive}
              />
            )}

            {user.role === 'ARTIST' && (
              <DropdownSection
                label="Menu du Dashboard"
                links={artistLinks}
                isActive={isActive}
                defaultOpen={anyArtistActive}
              />
            )}

            {user.role === 'LABEL' && (
              <DropdownSection
                label="Menu du Label"
                links={labelLinks}
                isActive={isActive}
                defaultOpen={pathname.startsWith('/label')}
              />
            )}

            {user.role === 'LISTENER' && (
              <Link
                href={ROUTES.USER_DASHBOARD}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Mon tableau de bord
              </Link>
            )}

            <div className="border-t border-border my-2" />

            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-surface transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link href={ROUTES.LOGIN}>
              <Button variant="primary" size="sm" className="w-full">
                Connexion
              </Button>
            </Link>
            <Link href={ROUTES.REGISTER}>
              <Button variant="ghost" size="sm" className="w-full">
                S&apos;inscrire
              </Button>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}

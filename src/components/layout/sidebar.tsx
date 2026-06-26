'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Compass, TrendingUp, ListMusic, MessageSquare, Headphones,
  Crown, Podcast, Radio, Ticket, Heart, Clock, Download,
  Upload, Library, Music,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME, ROUTES } from '@/lib/constants';

const menuLinks = [
  { href: '/', label: 'Accueil', icon: Compass },
  { href: '/explore', label: 'Explorer', icon: TrendingUp },
  { href: '/playlists', label: 'Playlists', icon: ListMusic },
  { href: '/feed', label: "Fil d'actu", icon: MessageSquare },
];

const discoverLinks = [
  { href: ROUTES.PREMIUM, label: 'Premium', icon: Crown },
  { href: ROUTES.PODCASTS, label: 'Podcasts', icon: Podcast },
  { href: ROUTES.LIVESTREAMS, label: 'En direct', icon: Radio, badge: true },
  { href: ROUTES.CHAT, label: 'Chat', icon: MessageSquare },
  { href: ROUTES.TICKETS, label: 'Tickets', icon: Ticket },
];

const libraryLinks = [
  { href: ROUTES.USER_LIBRARY, label: 'Ma Bibliothèque', icon: Library },
  { href: '/user/library?tab=favorites', label: 'Favoris', icon: Heart },
  { href: '/user/library?tab=recent', label: 'Récemment écoutés', icon: Clock },
  { href: ROUTES.OFFLINE, label: 'Téléchargements', icon: Download },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    const base = href.split('?')[0];
    if (base === '/') return pathname === '/';
    return pathname.startsWith(base);
  };

  return (
    <aside className="hidden md:flex sticky top-16 w-[380px] h-[calc(100vh-4rem)] shrink-0 flex-col bg-[#0d0d0d] z-40">
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-5 flex flex-col gap-6 scrollbar-hide">

        <div className="space-y-0.5">
          <p className="px-3 text-xs font-bold text-white uppercase tracking-[0.12em]">
            Menu
          </p>
          <div className="mt-2 space-y-0.5">
            {menuLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-bold transition-all duration-200',
                  isActive(link.href)
                    ? 'bg-[#222] text-white'
                    : 'text-white hover:bg-[#ffffff08]'
                )}
              >
                <link.icon className={cn(
                  'h-5 w-5 shrink-0 transition-colors duration-200',
                  isActive(link.href) ? 'text-[#ff9900]' : 'text-[#ff9900]'
                )} />
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-0.5">
          <p className="px-3 text-xs font-bold text-white uppercase tracking-[0.12em]">
            Découvrir
          </p>
          <div className="mt-2 space-y-0.5">
            {discoverLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-bold transition-all duration-200',
                  isActive(link.href)
                    ? 'bg-[#222] text-white'
                    : 'text-white hover:bg-[#ffffff08]'
                )}
              >
                {link.badge ? (
                  <span className="relative flex h-5 w-5 items-center justify-center shrink-0">
                    <link.icon className={cn(
                      'h-5 w-5 transition-colors duration-200',
                      isActive(link.href) ? 'text-[#ff9900]' : 'text-[#ff9900]'
                    )} />
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  </span>
                ) : (
                  <link.icon className={cn(
                    'h-5 w-5 shrink-0 transition-colors duration-200',
                    isActive(link.href) ? 'text-[#ff9900]' : 'text-[#ff9900]'
                  )} />
                )}
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-0.5">
          <p className="px-3 text-xs font-bold text-white uppercase tracking-[0.12em]">
            Bibliothèque
          </p>
          <div className="mt-2 space-y-0.5">
            {libraryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-bold transition-all duration-200',
                  isActive(link.href)
                    ? 'bg-[#222] text-white'
                    : 'text-white hover:bg-[#ffffff08]'
                )}
              >
                <link.icon className={cn(
                  'h-5 w-5 shrink-0 transition-colors duration-200',
                  isActive(link.href) ? 'text-[#ff9900]' : 'text-[#ff9900]'
                )} />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-[#ffffff08]">
        <Link
          href="/artist/upload"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#ff9900] text-white text-base font-bold hover:bg-[#e68a00] transition-all duration-200 shadow-lg shadow-[#ff9900]/20"
        >
          <Upload className="h-5 w-5" />
          UPLOADER
        </Link>
      </div>
    </aside>
  );
}

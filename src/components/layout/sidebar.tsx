'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass, TrendingUp, ListMusic, Rss, Library, Globe, Mic, BookOpen, Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const browseLinks = [
  { href: '/', label: 'Discover', icon: Compass },
  { href: '/explore', label: 'Charts', icon: TrendingUp },
  { href: '/playlists', label: 'Playlists', icon: ListMusic },
  { href: '/feed', label: 'Feed', icon: Rss },
  { href: '/user/library', label: 'My Library', icon: Library },
];

const originalsLinks = [
  { href: '/explore', label: 'Platform World', icon: Globe },
  { href: '/artist/dashboard', label: 'Studios', icon: Mic },
  { href: '/help', label: 'Artist Guide', icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  const isBrowseActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isOriginalsActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-72 flex-col border-r border-[#ffffff08] bg-[#0b0b0b] z-40">
      <div className="flex-1 overflow-y-auto py-8 px-5 space-y-10">
        <div className="space-y-1">
          <span className="px-3 text-xs font-bold tracking-[0.15em] text-[#666] uppercase">
            Browse
          </span>
          <div className="mt-3 space-y-1">
            {browseLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-bold transition-all duration-300',
                  isBrowseActive(link.href)
                    ? 'bg-[#222] text-white'
                    : 'text-[#888] hover:text-white hover:bg-[#ffffff08]'
                )}
              >
                <link.icon className={cn(
                  'h-5 w-5 transition-colors duration-300',
                  isBrowseActive(link.href) ? 'text-[#ff9900]' : 'text-[#666] group-hover:text-white'
                )} />
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <span className="px-3 text-xs font-bold tracking-[0.15em] text-[#666] uppercase">
            Originals
          </span>
          <div className="mt-3 space-y-1">
            {originalsLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-bold transition-all duration-300',
                  isOriginalsActive(link.href)
                    ? 'bg-[#222] text-white'
                    : 'text-[#888] hover:text-white hover:bg-[#ffffff08]'
                )}
              >
                <link.icon className={cn(
                  'h-5 w-5 transition-colors duration-300',
                  isOriginalsActive(link.href) ? 'text-[#ff9900]' : 'text-[#666] group-hover:text-white'
                )} />
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="pt-6">
          <Link
            href="/upload"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#ff9900] text-white text-base font-bold hover:bg-[#e68a00] transition-all duration-300 shadow-lg shadow-[#ff9900]/20"
          >
            <Upload className="h-5 w-5" />
            UPLOAD
          </Link>
        </div>
      </div>
    </aside>
  );
}

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
    <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-60 flex-col border-r border-[#ffffff08] bg-[#0b0b0b] z-40">
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        <div className="space-y-1">
          <span className="px-3 text-[0.65rem] font-semibold tracking-[0.15em] text-[#666] uppercase">
            Browse
          </span>
          <div className="mt-2 space-y-0.5">
            {browseLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300',
                  isBrowseActive(link.href)
                    ? 'bg-[#222] text-white'
                    : 'text-[#888] hover:text-white hover:bg-[#ffffff08]'
                )}
              >
                <link.icon className={cn(
                  'h-4 w-4 transition-colors duration-300',
                  isBrowseActive(link.href) ? 'text-[#ff9900]' : 'text-[#666] group-hover:text-white'
                )} />
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <span className="px-3 text-[0.65rem] font-semibold tracking-[0.15em] text-[#666] uppercase">
            Originals
          </span>
          <div className="mt-2 space-y-0.5">
            {originalsLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300',
                  isOriginalsActive(link.href)
                    ? 'bg-[#222] text-white'
                    : 'text-[#888] hover:text-white hover:bg-[#ffffff08]'
                )}
              >
                <link.icon className={cn(
                  'h-4 w-4 transition-colors duration-300',
                  isOriginalsActive(link.href) ? 'text-[#ff9900]' : 'text-[#666] group-hover:text-white'
                )} />
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Link
            href="/upload"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#ff9900] text-white text-sm font-bold hover:bg-[#e68a00] transition-all duration-300 shadow-lg shadow-[#ff9900]/20"
          >
            <Upload className="h-4 w-4" />
            UPLOAD
          </Link>
        </div>
      </div>
    </aside>
  );
}

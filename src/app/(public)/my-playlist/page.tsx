'use client';

import { ListenHistoryPlaylist } from '@/components/catalog/listen-history-playlist';
import { FavoritesPlaylist } from '@/components/catalog/favorites-playlist';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export default function MyPlaylistPage() {
  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <Link
        href={ROUTES.HOME}
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l&apos;accueil
      </Link>

      <ListenHistoryPlaylist />
      <FavoritesPlaylist />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { TrendingSongs } from '@/components/home/trending-songs';
import { TrendingAlbums } from '@/components/home/trending-albums';
import { AccountsForYou } from '@/components/home/accounts-for-you';
import { RecentlyAdded } from '@/components/home/recently-added';

interface TrackItem {
  id: string;
  title: string;
  artist: string;
  artistImage?: string | null;
  cover: string | null;
  plays?: number;
  genre?: string | null;
}

interface AlbumItem {
  id: string;
  cover: string | null;
  artist: string;
  title: string;
  genre?: string | null;
}

interface AccountItem {
  id: string;
  avatar: string | null;
  name: string;
  followers?: string;
}

interface SongItem {
  id: string;
  cover: string | null;
  artist: string;
  title: string;
  genre?: string | null;
}

export function GenreFilter({
  tracks,
  albums,
  accounts,
  recent,
}: {
  tracks: TrackItem[];
  albums: AlbumItem[];
  accounts: AccountItem[];
  recent: SongItem[];
}) {
  const [selected, setSelected] = useState('');

  const genreSet = new Set<string>();
  tracks.forEach((t) => { if (t.genre) genreSet.add(t.genre); });
  albums.forEach((a) => { if (a.genre) genreSet.add(a.genre); });
  recent.forEach((r) => { if (r.genre) genreSet.add(r.genre); });
  const genres = [
    { label: 'Tout', value: '' },
    ...Array.from(genreSet).sort().map((g) => ({ label: g, value: g })),
  ];

  const filteredTracks = selected
    ? tracks.filter((t) => t.genre?.toLowerCase() === selected.toLowerCase())
    : tracks;
  const filteredAlbums = selected
    ? albums.filter((a) => a.genre?.toLowerCase() === selected.toLowerCase())
    : albums;
  const filteredRecent = selected
    ? recent.filter((r) => r.genre?.toLowerCase() === selected.toLowerCase())
    : recent;

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 mb-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {genres.map((g) => (
            <button
              key={g.value}
              onClick={() => setSelected(g.value)}
              className={`shrink-0 rounded-full text-sm font-bold px-5 py-2 transition-colors ${
                selected === g.value
                  ? 'bg-primary text-black'
                  : 'border border-[#ffffff15] text-[#ccc] hover:border-primary/20 hover:text-white'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 mb-8">
        {filteredTracks.length > 0 ? (
          <TrendingSongs tracks={filteredTracks} />
        ) : (
          <div className="text-center py-12 text-[#666]">
            <p className="text-base font-medium">Aucun titre de ce genre</p>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 mb-8">
        {filteredAlbums.length > 0 ? (
          <TrendingAlbums albums={filteredAlbums} />
        ) : (
          <div className="text-center py-12 text-[#666]">
            <p className="text-base font-medium">Aucun album de ce genre</p>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 mb-8">
        <AccountsForYou accounts={accounts} />
      </div>

      <div className="mx-auto max-w-7xl px-4 mb-8">
        {filteredRecent.length > 0 ? (
          <RecentlyAdded songs={filteredRecent} />
        ) : (
          <div className="text-center py-12 text-[#666]">
            <p className="text-base font-medium">Aucun titre récent de ce genre</p>
          </div>
        )}
      </div>
    </>
  );
}

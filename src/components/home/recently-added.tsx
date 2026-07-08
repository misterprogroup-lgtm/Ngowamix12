import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { Play, Music } from 'lucide-react';
import { HorizontalScroll } from '@/components/ui/horizontal-scroll';

interface RecentlyAddedSong {
  id: string;
  cover: string | null;
  artist: string;
  title: string;
  slug?: string;
}

export function RecentlyAdded({ songs }: { songs: RecentlyAddedSong[] }) {
  if (!songs.length) return null;

  return (
    <HorizontalScroll title="AJOUTS RÉCENTS" withPadding={false}>
      {songs.map((song) => (
        <Link
          key={song.id}
          href={`/track/${song.id}`}
          className="group w-2/5 sm:w-1/4 shrink-0 snap-start px-1.5">
          <div className="relative aspect-square rounded-[10px] overflow-hidden bg-[#141414] border border-[#ffffff08] transition-all duration-300 group-hover:border-primary/20 group-hover:shadow-md group-hover:shadow-black/20">
            <SafeImage
              src={song.cover || ''}
              alt={song.title}
              fill
              sizes="185px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              fallback={
                <div className="flex h-full items-center justify-center text-[#666]">
                  <Music className="h-8 w-8" />
                </div>
              }
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="h-11 w-11 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
              </div>
            </div>
          </div>
          <div className="mt-2.5 space-y-0.5 px-0.5">
            <p className="text-xs text-[#999] truncate">{song.artist}</p>
            <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors duration-300">
              {song.title}
            </p>
          </div>
        </Link>
      ))}
    </HorizontalScroll>
  );
}

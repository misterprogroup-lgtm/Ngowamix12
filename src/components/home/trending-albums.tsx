import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { Play, Music } from 'lucide-react';
import { Carousel } from '@/components/ui/carousel';
import { SectionHeader } from '@/components/ui/section-header';

interface TrendingAlbum {
  id: string;
  cover: string | null;
  artist: string;
  title: string;
  slug?: string;
}

export function TrendingAlbums({ albums }: { albums: TrendingAlbum[] }) {
  if (!albums.length) return null;

  return (
    <section>
      <SectionHeader title="ALBUMS TENDANCES" />
      <Carousel gap={20}>
        {albums.map((album) => (
          <Link
            key={album.id}
            href={`/album/${album.id}`}
            className="group w-40 md:w-44 shrink-0 snap-start"
          >
            <div className="relative aspect-square rounded-[10px] overflow-hidden bg-[#141414] border border-[#ffffff08] transition-all duration-300 group-hover:scale-[1.03] group-hover:border-[#ff990033] group-hover:shadow-lg group-hover:shadow-black/30">
              <SafeImage
                src={album.cover || ''}
                alt={album.title}
                fill
                sizes="176px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                fallback={
                  <div className="flex h-full items-center justify-center text-[#666]">
                    <Music className="h-10 w-10" />
                  </div>
                }
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-[#ff9900] text-white shadow-lg shadow-[#ff9900]/30 flex items-center justify-center translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                  <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-0.5 px-0.5">
              <p className="text-xs text-[#999] font-medium truncate">{album.artist}</p>
              <p className="text-sm font-bold text-white truncate group-hover:text-[#ff9900] transition-colors duration-300">
                {album.title}
              </p>
            </div>
          </Link>
        ))}
      </Carousel>
    </section>
  );
}

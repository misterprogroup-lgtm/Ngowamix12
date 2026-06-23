import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { Play, Music, ArrowRight } from 'lucide-react';

const TRENDING = [
  { id: '1', title: 'African Dream', artist: 'Koffi Olomide', artistImage: '/images/artist-avatar.jpg', cover: '/uploads/covers/placeholder.svg', plays: '2.4M' },
  { id: '2', title: 'Sunset Vibes', artist: 'Fally Ipupa', artistImage: '/images/artist-avatar.jpg', cover: '/uploads/covers/placeholder.svg', plays: '1.8M' },
  { id: '3', title: 'Dance All Night', artist: 'Diamond Platnumz', artistImage: '/images/artist-avatar.jpg', cover: '/uploads/covers/placeholder.svg', plays: '3.1M' },
  { id: '4', title: 'Sweet Melody', artist: 'Aya Nakamura', artistImage: '/images/artist-avatar.jpg', cover: '/uploads/covers/placeholder.svg', plays: '2.7M' },
  { id: '5', title: 'Rhythm & Flow', artist: 'Burna Boy', artistImage: '/images/artist-avatar.jpg', cover: '/uploads/covers/placeholder.svg', plays: '4.2M' },
  { id: '6', title: 'Ocean Eyes', artist: 'Wizkid', artistImage: '/images/artist-avatar.jpg', cover: '/uploads/covers/placeholder.svg', plays: '1.5M' },
];

function MusicCard({ song }: { song: typeof TRENDING[number] }) {
  return (
    <div className="group relative w-44 shrink-0">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#141414] border border-[#ffffff08] transition-all duration-300 group-hover:border-[#ff990033] group-hover:shadow-lg group-hover:shadow-black/30">
        <SafeImage
          src={song.cover}
          alt={song.title}
          fill
          sizes="176px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          fallback={
            <div className="flex h-full items-center justify-center text-[#666]">
              <Music className="h-10 w-10" />
            </div>
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="h-12 w-12 rounded-full bg-[#ff9900] text-white shadow-lg shadow-[#ff9900]/30 flex items-center justify-center translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
          </div>
        </div>
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[10px] text-white font-medium">{song.plays}</span>
        </div>
      </div>
      <div className="mt-3 space-y-0.5 px-0.5">
        <p className="text-sm font-semibold text-white truncate group-hover:text-[#ff9900] transition-colors duration-300">
          {song.title}
        </p>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-[#1f1f1f] overflow-hidden shrink-0 ring-1 ring-[#ffffff15]">
            <SafeImage
              src={song.artistImage}
              alt={song.artist}
              width={20}
              height={20}
              className="object-cover w-full h-full"
              fallback={<Music className="h-2.5 w-2.5 m-1 text-[#666]" />}
            />
          </div>
          <p className="text-xs text-[#888] truncate">{song.artist}</p>
        </div>
      </div>
    </div>
  );
}

export function TrendingSongs() {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
          TRENDING SONGS
        </h2>
        <Link
          href="/explore"
          className="flex items-center gap-1 text-sm font-medium text-[#888] hover:text-[#ff9900] transition-colors duration-300"
        >
          VIEW ALL
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-scroll-container pb-2">
        {TRENDING.map((song) => (
          <MusicCard key={song.id} song={song} />
        ))}
      </div>
    </section>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Play, Upload, Music } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';

interface Track {
  id: string;
  title: string;
  album: {
    coverImage: string | null;
    artist: { name: string };
  };
}

export function HeroBanner({ tracks }: { tracks: Track[] }) {
  const featured = tracks.slice(0, 4);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1100] via-[#0b0b0b] to-[#0a0a0a] border border-[#ffffff08]">
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary opacity-[0.04] rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-primary opacity-[0.03] rounded-full blur-3xl" />
      <div className="relative grid md:grid-cols-2 gap-8 items-center p-6 md:p-10 lg:p-12">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
              Streaming gratuit
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-white">
            La musique africaine{' '}
            <span className="text-primary">à portée</span>{' '}
            de clic
          </h1>
          <p className="text-sm md:text-base text-[#888] leading-relaxed max-w-md">
            Écoutez, découvrez et soutenez vos artistes africains préférés.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/explore">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary-hover text-white rounded-full font-bold px-7 h-[52px] text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
              >
                <Play className="h-4 w-4" />
                Commencer
              </Button>
            </Link>
            <Link href="/artist/upload">
              <Button
                variant="ghost"
                size="lg"
                className="rounded-full border border-[#ffffff15] text-[#ccc] hover:text-white hover:bg-[#ffffff0a] h-[52px] text-sm"
              >
                <Upload className="h-4 w-4" />
                Uploadez votre musique
              </Button>
            </Link>
          </div>
        </div>

        <div className="hidden md:flex justify-center items-center">
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {featured.map((track) => (
              <Link
                key={track.id}
                href={`/track/${track.id}`}
                className="group relative aspect-square rounded-xl overflow-hidden bg-[#141414] border border-[#ffffff08] transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-black/30"
              >
                <SafeImage
                  src={track.album?.coverImage || ''}
                  alt={track.title}
                  fill
                  sizes="160px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  fallback={
                    <div className="flex h-full items-center justify-center text-[#555]">
                      <Music className="h-8 w-8" />
                    </div>
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="h-10 w-10 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 right-2 z-10">
                  <p className="text-xs font-bold text-white truncate drop-shadow-lg">{track.title}</p>
                  <p className="text-[10px] text-[#bbb] truncate drop-shadow-lg">{track.album?.artist?.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

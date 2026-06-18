import Link from 'next/link';
import { Music, Heart, Zap, Globe, Sunrise, Moon, Flame, Cloud, Coffee } from 'lucide-react';
import { HorizontalScroll } from '@/components/ui/horizontal-scroll';

const genreIcons = [
  { icon: Music, color: 'from-primary/20 to-accent/20 text-primary' },
  { icon: Heart, color: 'from-red-500/20 to-pink-500/20 text-red-400' },
  { icon: Zap, color: 'from-yellow-500/20 to-orange-500/20 text-yellow-400' },
  { icon: Globe, color: 'from-green-500/20 to-emerald-500/20 text-green-400' },
  { icon: Sunrise, color: 'from-blue-500/20 to-cyan-500/20 text-blue-400' },
  { icon: Moon, color: 'from-purple-500/20 to-indigo-500/20 text-purple-400' },
  { icon: Flame, color: 'from-red-600/20 to-orange-600/20 text-red-500' },
  { icon: Cloud, color: 'from-sky-500/20 to-blue-500/20 text-sky-400' },
  { icon: Coffee, color: 'from-amber-500/20 to-brown-500/20 text-amber-400' },
  { icon: Music, color: 'from-teal-500/20 to-cyan-500/20 text-teal-400' },
];

const genres = [
  'Afrobeats', 'Amapiano', 'Coupé-décalé', 'Bongo Flava',
  'Rumba', 'Hip-Hop', 'Gospel', 'Zouk',
  'Makossa', 'Soukous',
];

export function GenreGrid() {
  return (
    <section>
      <div className="container mx-auto px-4">
        <HorizontalScroll title="Explorer par genre" seeAllHref="/explore">
          {genres.map((genre, index) => {
            const { icon: Icon, color } = genreIcons[index % genreIcons.length];
            return (
              <Link
                key={genre}
                href={`/explore?genre=${encodeURIComponent(genre)}`}
                className="snap-start shrink-0 flex flex-col items-center gap-3 p-5 rounded-xl bg-surface hover:bg-surface-hover transition-all group w-[130px]"
              >
                <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-text-primary text-center group-hover:text-primary transition-colors">
                  {genre}
                </span>
              </Link>
            );
          })}
        </HorizontalScroll>
      </div>
    </section>
  );
}

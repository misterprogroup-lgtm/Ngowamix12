import Image from 'next/image';
import Link from 'next/link';
import { Music } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArtistCardProps {
  id: string;
  name: string;
  slug: string;
  avatar: string | null;
  isVerified?: boolean;
  className?: string;
}

export function ArtistCard({
  id,
  name,
  slug,
  avatar,
  isVerified = false,
  className,
}: ArtistCardProps) {
  return (
    <Link
      href={`/artist/${slug}`}
      className={cn(
        'group flex flex-col items-center gap-3 text-center transition-transform hover:scale-105',
        className
      )}
    >
      <div className="relative h-32 w-32 overflow-hidden rounded-full bg-surface-hover">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-110"
            sizes="128px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text-muted">
            <Music className="h-10 w-10" />
          </div>
        )}
        {isVerified && (
          <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white">
            ✓
          </div>
        )}
      </div>
      <div>
        <p className="font-semibold text-text-primary group-hover:text-primary transition-colors">
          {name}
        </p>
        <p className="text-xs text-text-muted">Artiste</p>
      </div>
    </Link>
  );
}

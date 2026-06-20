import { SafeImage } from '@/components/ui/safe-image';
import Link from 'next/link';
import { Music, Headphones } from 'lucide-react';

interface PodcastCardProps {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  description: string | null;
  episodeCount: number;
  author: string | null;
  user: { displayName: string | null; avatar: string | null } | null;
}

export function PodcastCard({
  id,
  title,
  slug,
  coverImage,
  description,
  episodeCount,
  author,
  user,
}: PodcastCardProps) {
  return (
    <div className="group">
      <Link href={`/podcasts/${id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-hover">
          {coverImage ? (
            <SafeImage
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
              fallback={<div className="flex h-full items-center justify-center text-text-muted"><Music className="h-12 w-12" /></div>}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-text-muted">
              <Music className="h-12 w-12" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1">
            <Headphones className="h-3 w-3" />
            {episodeCount} épisode{episodeCount > 1 ? 's' : ''}
          </div>
        </div>
      </Link>
      <div className="mt-3 space-y-1">
        <Link href={`/podcasts/${id}`}>
          <p className="font-medium text-text-primary truncate group-hover:text-primary transition-colors">
            {title}
          </p>
        </Link>
        <p className="text-sm text-text-muted truncate">
          {author || user?.displayName || 'Podcast'}
        </p>
        {description && (
          <p className="text-xs text-text-muted line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

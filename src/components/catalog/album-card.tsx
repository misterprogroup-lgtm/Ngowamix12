import { SafeImage } from '@/components/ui/safe-image';
import Link from 'next/link';
import { Play, Music, Star, BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, formatPrice } from '@/lib/utils';
import { ShareButton } from '@/components/catalog/share-button';
import { PremiumLockOverlay } from '@/components/premium/premium-lock-overlay';

interface AlbumCardProps {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  artistName: string;
  artistSlug: string;
  price: number;
  isPremiumOnly?: boolean;
  currency?: string;
  type?: 'ALBUM' | 'SINGLE' | 'EP';
  className?: string;
  averageRating?: number;
  totalReviews?: number;
  isArtistVerified?: boolean;
}

export function AlbumCard({
  id,
  title,
  slug,
  coverImage,
  artistName,
  artistSlug,
  price,
  isPremiumOnly = false,
  currency = 'XOF',
  type,
  className,
  averageRating,
  totalReviews,
  isArtistVerified = false,
}: AlbumCardProps) {
  const typeLabel = type === 'SINGLE' ? 'Single' : type === 'EP' ? 'EP' : '';

  return (
    <div className={cn('group transition-all duration-300 hover:-translate-y-1', className)}>
      <Link href={`/album/${id}`} className="relative block">
        <div className="relative aspect-square overflow-hidden bg-surface-hover shadow-md shadow-black/5">
          {coverImage ? (
            <SafeImage
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              fallback={<div className="flex h-full items-center justify-center text-text-muted"><Music className="h-12 w-12" /></div>}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-text-muted">
              <Music className="h-12 w-12" />
            </div>
          )}
          <PremiumLockOverlay isPremiumOnly={isPremiumOnly} variant="card" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 translate-y-2 group-hover:translate-y-0 transition-all">
              <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
            </div>
          </div>
          <div className="absolute top-2 left-2 flex gap-1.5">
            {typeLabel && (
              <Badge variant="secondary">{typeLabel}</Badge>
            )}
            {isPremiumOnly && (
              <Badge variant="premium">Premium</Badge>
            )}
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ShareButton url={`/album/${id}`} title={title} artistName={artistName} coverImage={coverImage} type="album" />
          </div>
        </div>
      </Link>
      <div className="mt-3 space-y-1">
        <Link href={`/album/${id}`}>
          <p className="font-medium text-text-primary truncate group-hover:text-primary transition-colors">
            {title}
          </p>
        </Link>
        <Link href={`/artist/${artistSlug}`} className="flex items-center gap-1">
          <p className="text-sm text-text-secondary truncate hover:text-primary transition-colors cursor-pointer">
            {artistName}
          </p>
          {isArtistVerified && (
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
          )}
        </Link>
        {averageRating && averageRating > 0 ? (
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="text-xs text-text-secondary">
              {averageRating.toFixed(1)} ({totalReviews})
            </span>
          </div>
        ) : null}
        {type === 'SINGLE' ? (
          <p className="text-sm font-medium text-success">
            Gratuit
          </p>
        ) : price > 0 ? (
          <p className="text-sm font-medium text-accent">
            {formatPrice(price, currency)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, Clock, Music, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConcertCardProps {
  id: string;
  title: string;
  slug: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  price: number;
  vipPrice: number | null;
  availableTickets: number;
  totalTickets: number;
  poster: string | null;
  artistName: string;
  artistSlug: string;
  isArtistVerified?: boolean;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function ConcertCard({
  id,
  title,
  slug,
  venue,
  city,
  date,
  time,
  price,
  vipPrice,
  availableTickets,
  totalTickets,
  poster,
  artistName,
  artistSlug,
  isArtistVerified = false,
}: ConcertCardProps) {
  const soldOut = availableTickets === 0;
  const soldPercentage = totalTickets > 0 ? ((totalTickets - availableTickets) / totalTickets) * 100 : 0;

  return (
    <div className="group rounded-xl border border-border bg-surface overflow-hidden hover:border-primary/50 transition-colors">
      <div className="relative aspect-video overflow-hidden bg-surface-hover">
        {poster ? (
          <Image
            src={poster}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text-muted">
            <Music className="h-12 w-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {soldOut && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-red-500/90 text-xs font-bold text-white">
            Complet
          </div>
        )}

        {soldPercentage > 70 && !soldOut && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-orange-500/90 text-xs font-bold text-white">
            Bientôt complet
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-xs text-white/70 mb-1">{formatDate(date)}</p>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-text-secondary">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{venue}, {city}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <Clock className="h-4 w-4 shrink-0 text-primary" />
            <span>{time}</span>
          </div>
          <Link href={`/artist/${artistSlug}`} className="flex items-center gap-2 text-primary hover:underline">
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="truncate">{artistName}</span>
            {isArtistVerified && (
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
            )}
          </Link>
        </div>

        {totalTickets > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-text-muted">
              <span>Places disponibles</span>
              <span>{availableTickets} / {totalTickets}</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-hover overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(availableTickets / totalTickets) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <p className="text-lg font-bold text-text-primary">
              {price.toLocaleString('fr-FR')} F CFA
            </p>
            {vipPrice && (
              <p className="text-xs text-text-muted">
                VIP: {vipPrice.toLocaleString('fr-FR')} F CFA
              </p>
            )}
          </div>

          <Link href={`/tickets/${id}`}>
            <Button variant="primary" size="sm" disabled={soldOut}>
              {soldOut ? 'Complet' : 'Réserver'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

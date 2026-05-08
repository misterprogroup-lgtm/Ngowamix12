import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Calendar, Clock, Music, Share2, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TicketReservation } from '@/components/catalog/ticket-reservation';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getConcert(id: string) {
  const concert = await db.concert.findUnique({
    where: { id },
    include: {
      artist: {
        select: { name: true, slug: true, avatar: true, bio: true, isVerified: true },
      },
    },
  });

  if (!concert) return null;
  return concert;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const concert = await getConcert(id);
  if (!concert) return { title: 'Concert non trouvé' };

  return {
    title: `${concert.title} — Ngowamix`,
    description: `Réservez vos tickets pour ${concert.title} de ${concert.artist.name} à ${concert.venue}, ${concert.city}.`,
  };
}

function formatDate(date: Date) {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function ConcertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const concert = await getConcert(id);

  if (!concert) notFound();

  const totalAvailable = concert.availableTickets + (concert.vipAvailableTickets ?? 0);
  const soldOut = totalAvailable === 0;

  return (
    <div className="pb-24">
      <section className="relative">
        <div className="relative h-72 md:h-96 overflow-hidden">
          {concert.poster ? (
            <Image src={concert.poster} alt={concert.title} fill className="object-cover" priority />
          ) : (
            <div className="h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Music className="h-24 w-24 text-text-muted" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {soldOut ? (
                    <Badge variant="error">Complet</Badge>
                  ) : (
                    <Badge variant="success">En vente</Badge>
                  )}
                  <span className="text-sm text-text-muted">{totalAvailable} places restantes</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                  {concert.title}
                </h1>
              </div>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="md:col-span-2 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-text-secondary">
                    <MapPin className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-lg">{concert.venue}, {concert.city}, {concert.country}</span>
                  </div>
                  <div className="flex items-center gap-3 text-text-secondary">
                    <Calendar className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-lg">{formatDate(concert.date)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-text-secondary">
                    <Clock className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-lg">{concert.time}</span>
                  </div>
                </div>

                {concert.description && (
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-3">À propos de l&apos;événement</h2>
                    <p className="text-text-secondary whitespace-pre-line">{concert.description}</p>
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-3">Artiste</h2>
                  <div className="flex items-center gap-4">
                    {concert.artist.avatar ? (
                      <Image
                        src={concert.artist.avatar}
                        alt={concert.artist.name}
                        width={64}
                        height={64}
                        className="rounded-full object-cover h-16 w-16"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-surface-hover flex items-center justify-center">
                        <Music className="h-8 w-8 text-text-muted" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="font-semibold text-text-primary">{concert.artist.name}</h3>
                        {concert.artist.isVerified && (
                          <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </div>
                      {concert.artist.bio && (
                        <p className="text-sm text-text-secondary line-clamp-2">{concert.artist.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1">
                <TicketReservation concert={concert} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from 'next';
import { Ticket, MapPin } from 'lucide-react';
import { ConcertCard } from '@/components/catalog/concert-card';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Concerts & Tickets — ${APP_NAME}`,
  description: 'Réservez vos tickets pour les concerts de vos artistes préférés.',
};

export const dynamic = 'force-dynamic';

async function getConcerts() {
  try {
    const res = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/concerts?limit=20`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return data.concerts || [];
  } catch {
    return [];
  }
}

export default async function TicketsPage() {
  const concerts = await getConcerts();

  return (
    <div className="pb-24">
      <section className="relative py-12 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary mb-4">
              <Ticket className="h-4 w-4" />
              Billetterie
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Concerts & Événements
            </h1>
            <p className="text-lg text-text-secondary">
              Réservez vos places pour les prochains concerts de vos artistes africains préférés.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {concerts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {concerts.map((concert: {
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
                artist: { name: string; slug: string; avatar: string | null; isVerified?: boolean };
              }) => (
                <ConcertCard
                  key={concert.id}
                  id={concert.id}
                  title={concert.title}
                  slug={concert.slug}
                  venue={concert.venue}
                  city={concert.city}
                  date={concert.date}
                  time={concert.time}
                  price={Number(concert.price)}
                  vipPrice={concert.vipPrice ? Number(concert.vipPrice) : null}
                  availableTickets={concert.availableTickets}
                  totalTickets={concert.totalTickets}
                  poster={concert.poster}
                  artistName={concert.artist.name}
                  artistSlug={concert.artist.slug}
                  isArtistVerified={concert.artist.isVerified}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Ticket className="h-16 w-16 mx-auto text-text-muted mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Aucun concert prévu pour le moment
              </h2>
              <p className="text-text-secondary">
                Revenez bientôt pour découvrir les prochains événements.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

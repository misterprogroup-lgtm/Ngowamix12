'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth-store';
import { ROUTES } from '@/lib/constants';

type TicketType = 'STANDARD' | 'VIP';

interface TicketReservationProps {
  concert: {
    id: string;
    title: string;
    price: number;
    vipPrice: number | null;
    availableTickets: number;
    vipAvailableTickets: number;
  };
}

export function TicketReservation({ concert }: TicketReservationProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [ticketType, setTicketType] = useState<TicketType>('STANDARD');
  const [buying, setBuying] = useState(false);

  const soldOut = concert.availableTickets === 0;
  const vipSoldOut = !concert.vipPrice || concert.vipAvailableTickets === 0;

  const handleReserve = async () => {
    if (!user) {
      router.push(`${ROUTES.LOGIN}?redirect=/tickets/${concert.id}`);
      return;
    }

    setBuying(true);
    try {
      const price = ticketType === 'VIP' ? (concert.vipPrice ?? concert.price) : concert.price;
      const productId = `${concert.id}:${ticketType}`;

      const res = await fetch('/api/payment/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: price,
          description: `Billet ${ticketType === 'VIP' ? 'VIP' : 'Standard'} - ${concert.title}`,
          type: 'TICKET_PURCHASE',
          productId,
          paymentMethod: 'MOBILE_MONEY',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la réservation');
      }

      window.location.href = data.paymentUrl;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la réservation');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6 sticky top-24 space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Billets</h3>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => !soldOut && setTicketType('STANDARD')}
          className={`w-full flex justify-between items-center p-3 rounded-lg border text-left transition-colors ${
            ticketType === 'STANDARD' && !soldOut
              ? 'border-primary bg-primary/5'
              : 'border-border'
          } ${soldOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-text-muted'}`}
        >
          <div>
            <p className="font-medium text-text-primary">Standard</p>
            <p className="text-sm text-text-muted">
              {soldOut ? 'Complet' : `${concert.availableTickets} places`}
            </p>
          </div>
          <p className="text-lg font-bold text-text-primary">
            {concert.price.toLocaleString('fr-FR')} F
          </p>
        </button>

        {concert.vipPrice && (
          <button
            type="button"
            onClick={() => !vipSoldOut && setTicketType('VIP')}
            className={`w-full flex justify-between items-center p-3 rounded-lg border text-left transition-colors ${
              ticketType === 'VIP' && !vipSoldOut
                ? 'border-primary bg-primary/5'
                : 'border-border'
            } ${vipSoldOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-text-muted'}`}
          >
            <div>
              <p className="font-medium text-text-primary flex items-center gap-1">
                <Ticket className="h-4 w-4 text-primary" />
                VIP
              </p>
              <p className="text-sm text-text-muted">
                {vipSoldOut ? 'Complet' : `${concert.vipAvailableTickets} places`}
              </p>
            </div>
            <p className="text-lg font-bold text-primary">
              {concert.vipPrice.toLocaleString('fr-FR')} F
            </p>
          </button>
        )}
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={ticketType === 'VIP' ? vipSoldOut : soldOut}
        onClick={handleReserve}
        isLoading={buying}
      >
        {buying ? (
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <Ticket className="h-5 w-5 mr-2" />
        )}
        {(ticketType === 'VIP' ? vipSoldOut : soldOut) ? 'Complet' : 'Réserver maintenant'}
      </Button>

      <p className="text-xs text-text-muted text-center">
        Les billets sont envoyés par email après le paiement.
      </p>
    </div>
  );
}

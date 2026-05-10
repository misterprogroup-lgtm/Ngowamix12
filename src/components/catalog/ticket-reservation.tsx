'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, Loader2, Minus, Plus, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState(user?.email || '');
  const [buying, setBuying] = useState(false);

  const maxQty = ticketType === 'VIP'
    ? (concert.vipAvailableTickets || 0)
    : concert.availableTickets;
  const soldOut = maxQty === 0;
  const unitPrice = ticketType === 'VIP' ? (concert.vipPrice ?? concert.price) : concert.price;

  const handleReserve = async () => {
    if (!user) {
      router.push(`${ROUTES.LOGIN}?redirect=/tickets/${concert.id}`);
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Veuillez entrer un email valide pour recevoir vos billets.');
      return;
    }

    setBuying(true);
    try {
      const productId = `${concert.id}:${ticketType}:${quantity}`;

      const res = await fetch('/api/payment/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: unitPrice * quantity,
          description: `${quantity > 1 ? `${quantity}x ` : ''}Billet ${ticketType === 'VIP' ? 'VIP' : 'Standard'} - ${concert.title}`,
          type: 'TICKET_PURCHASE',
          productId,
          paymentMethod: 'MOBILE_MONEY',
          recipientEmail: email,
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
          onClick={() => { setTicketType('STANDARD'); setQuantity(1); }}
          disabled={concert.availableTickets === 0}
          className={`w-full flex justify-between items-center p-3 rounded-lg border text-left transition-colors ${
            ticketType === 'STANDARD'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-text-muted'
          } ${concert.availableTickets === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div>
            <p className="font-medium text-text-primary">Standard</p>
            <p className="text-sm text-text-muted">
              {concert.availableTickets === 0 ? 'Complet' : `${concert.availableTickets} places`}
            </p>
          </div>
          <p className="text-lg font-bold text-text-primary">
            {concert.price.toLocaleString('fr-FR')} F
          </p>
        </button>

        {concert.vipPrice && (
          <button
            type="button"
            onClick={() => { setTicketType('VIP'); setQuantity(1); }}
            disabled={concert.vipAvailableTickets === 0}
            className={`w-full flex justify-between items-center p-3 rounded-lg border text-left transition-colors ${
              ticketType === 'VIP'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-text-muted'
            } ${concert.vipAvailableTickets === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div>
              <p className="font-medium text-text-primary flex items-center gap-1">
                <Ticket className="h-4 w-4 text-primary" />
                VIP
              </p>
              <p className="text-sm text-text-muted">
                {concert.vipAvailableTickets === 0 ? 'Complet' : `${concert.vipAvailableTickets} places`}
              </p>
            </div>
            <p className="text-lg font-bold text-primary">
              {concert.vipPrice.toLocaleString('fr-FR')} F
            </p>
          </button>
        )}
      </div>

      {!soldOut && (
        <>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-sm font-medium text-text-primary">Quantité</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-muted hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-semibold text-text-primary">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                disabled={quantity >= maxQty}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-muted hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-text-muted" />
              Recevoir les billets par email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </>
      )}

      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-text-muted">Total</span>
        <span className="text-xl font-bold text-text-primary">
          {(unitPrice * quantity).toLocaleString('fr-FR')} F
        </span>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={soldOut}
        onClick={handleReserve}
        isLoading={buying}
      >
        {buying ? (
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <Ticket className="h-5 w-5 mr-2" />
        )}
        {soldOut ? 'Complet' : `Réserver${quantity > 1 ? ` (${quantity}x)` : ''}`}
      </Button>

      <p className="text-xs text-text-muted text-center">
        Les billets sont envoyés par email après le paiement.
      </p>
    </div>
  );
}

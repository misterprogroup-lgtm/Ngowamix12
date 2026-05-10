'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Ticket, MapPin, Calendar, Clock, QrCode, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';

interface TicketData {
  id: string;
  type: 'STANDARD' | 'VIP';
  price: number;
  qrCode: string;
  status: string;
  recipientEmail: string | null;
  purchasedAt: string;
  concert: {
    id: string;
    title: string;
    slug: string;
    venue: string;
    city: string;
    date: string;
    time: string;
    poster: string | null;
  };
}

export default function UserTicketsPage() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/user/tickets');
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error('Fetch tickets error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'PURCHASED': return { label: 'Valide', variant: 'success' as const };
      case 'USED': return { label: 'Utilisé', variant: 'error' as const };
      case 'CANCELLED': return { label: 'Annulé', variant: 'error' as const };
      default: return { label: status, variant: 'warning' as const };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-48 bg-surface-hover rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-surface-hover rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Ticket className="h-6 w-6 text-accent" />
        Mes billets
      </h1>

      {tickets.length === 0 ? (
        <div className="text-center py-16">
          <Ticket className="h-16 w-16 text-text-muted mx-auto mb-4 opacity-50" />
          <h2 className="text-lg font-medium text-text-secondary mb-2">
            Aucun billet pour le moment
          </h2>
          <p className="text-text-muted mb-6">
            Les billets achetés apparaîtront ici. Présentez le QR code à l&apos;entrée.
          </p>
          <Link href="/tickets">
            <Button variant="primary">Voir les concerts</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          {tickets.map((ticket) => {
            const st = statusLabel(ticket.status);
            const isExpanded = expanded === ticket.id;

            return (
              <div key={ticket.id} className="rounded-xl border border-border bg-surface overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : ticket.id)}
                  className="w-full p-4 flex items-center gap-4 text-left hover:bg-surface-hover transition-colors"
                >
                  <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Ticket className={`h-6 w-6 ${ticket.type === 'VIP' ? 'text-primary' : 'text-text-muted'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary truncate">
                      {ticket.concert.title}
                    </p>
                    <p className="text-sm text-text-secondary truncate">
                      {ticket.concert.venue}, {ticket.concert.city}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatDate(ticket.concert.date)} à {ticket.concert.time}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={st.variant}>{st.label}</Badge>
                    <p className="text-xs text-text-muted mt-1">
                      {ticket.type === 'VIP' ? 'VIP' : 'Standard'}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-text-muted shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-text-muted shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-border p-6 space-y-4">
                    <div className="flex justify-center">
                      <div className="bg-white rounded-xl p-4 inline-block">
                        <QRCodeSVG
                          value={ticket.qrCode}
                          size={200}
                          level="H"
                          includeMargin
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <p className="text-text-muted">Événement</p>
                        <p className="font-medium text-text-primary">{ticket.concert.title}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-text-muted">Type</p>
                        <p className="font-medium text-text-primary">{ticket.type === 'VIP' ? 'VIP' : 'Standard'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-text-muted">Lieu</p>
                        <p className="font-medium text-text-primary">{ticket.concert.venue}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-text-muted">Ville</p>
                        <p className="font-medium text-text-primary">{ticket.concert.city}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-text-muted">Date</p>
                        <p className="font-medium text-text-primary">{formatDate(ticket.concert.date)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-text-muted">Heure</p>
                        <p className="font-medium text-text-primary">{ticket.concert.time}</p>
                      </div>
                    </div>

                    {ticket.recipientEmail && (
                      <div className="text-xs text-text-muted text-center">
                        Billet envoyé à : {ticket.recipientEmail}
                      </div>
                    )}

                    <p className="text-xs text-text-muted text-center">
                      Présentez ce QR code à l&apos;entrée du concert pour valider votre billet.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

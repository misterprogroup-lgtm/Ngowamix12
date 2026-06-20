import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { initPaymentPage as pawapayInit, generateDepositId } from '@/lib/pawapay';

const TEST_USER = { sub: 'user-1', email: 'test@test.com', role: 'LISTENER' as const, isPremium: false };

function mockDb() {
  Object.assign(db, {
    transaction: { create: vi.fn() },
    siteConfig: { findUnique: vi.fn() },
    concert: { findUnique: vi.fn() },
    promoCode: { findUnique: vi.fn(), update: vi.fn() },
    usedPromoCode: { create: vi.fn() },
    user: { findUnique: vi.fn() },
  });
}

async function callInit(body: Record<string, unknown>) {
  const { POST } = await import('@/app/api/payment/init/route');
  return POST(new Request('http://localhost:3000/api/payment/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));
}

describe('Payment Init', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb();
    vi.mocked(getCurrentUser).mockResolvedValue(TEST_USER);
    vi.mocked(generateDepositId).mockReturnValue('deposit-1');
    vi.mocked(pawapayInit).mockResolvedValue({ redirectUrl: 'https://pay.pawapay.io/session' });
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const res = await callInit({ amount: 5000, description: 'Premium', type: 'SUBSCRIPTION', productId: 'premium' });
    expect(res.status).toBe(401);
  });

  it('validates request body with zod', async () => {
    const res = await callInit({});
    expect(res.status).toBe(400);
  });

  it('validates SUBSCRIPTION amount matches config', async () => {
    vi.mocked(db.siteConfig.findUnique).mockResolvedValue({ premiumPrice: 5000 } as any);

    const res = await callInit({
      amount: 3000,
      description: 'Premium',
      type: 'SUBSCRIPTION',
      productId: 'premium',
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Montant invalide');
  });

  it('accepts SUBSCRIPTION with valid amount', async () => {
    vi.mocked(db.siteConfig.findUnique).mockResolvedValue({ premiumPrice: 5000 } as any);
    vi.mocked(db.transaction.create).mockResolvedValue({ id: 'tx-1' } as any);

    const res = await callInit({
      amount: 5000,
      description: 'Abonnement Premium',
      type: 'SUBSCRIPTION',
      productId: 'premium',
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.transactionId).toBe('tx-1');
    expect(data.paymentUrl).toBe('https://pay.pawapay.io/session');
  });

  it('validates TICKET_PURCHASE productId format', async () => {
    const res = await callInit({
      amount: 5000,
      description: 'Ticket',
      type: 'TICKET_PURCHASE',
      productId: 'invalid-format',
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Format de produit invalide');
  });

  it('validates TICKET_PURCHASE quantity range', async () => {
    const res = await callInit({
      amount: 50000,
      description: 'Ticket',
      type: 'TICKET_PURCHASE',
      productId: 'concert-1:VIP:25',
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Quantité invalide');
  });

  it('validates TICKET_PURCHASE concert exists', async () => {
    vi.mocked(db.concert.findUnique).mockResolvedValue(null);

    const res = await callInit({
      amount: 5000,
      description: 'Ticket',
      type: 'TICKET_PURCHASE',
      productId: 'concert-1:STANDARD:1',
    });

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe('Concert introuvable');
  });

  it('validates TICKET_PURCHASE availability', async () => {
    vi.mocked(db.concert.findUnique).mockResolvedValue({
      availableTickets: 1,
      vipAvailableTickets: 0,
      price: 5000,
    } as any);

    const res = await callInit({
      amount: 25000,
      description: 'Ticket',
      type: 'TICKET_PURCHASE',
      productId: 'concert-1:STANDARD:5',
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Seulement 1 place');
  });

  it('validates TICKET_PURCHASE amount matches price * qty', async () => {
    vi.mocked(db.concert.findUnique).mockResolvedValue({
      availableTickets: 10,
      vipAvailableTickets: 10,
      price: 5000,
      vipPrice: 10000,
    } as any);

    const res = await callInit({
      amount: 3000,
      description: 'Ticket',
      type: 'TICKET_PURCHASE',
      productId: 'concert-1:STANDARD:2',
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Montant invalide');
  });

  it('creates transaction with correct data for ALBUM_PURCHASE', async () => {
    vi.mocked(db.transaction.create).mockResolvedValue({ id: 'tx-1' } as any);

    await callInit({
      amount: 2000,
      description: 'Achat album Test',
      type: 'ALBUM_PURCHASE',
      productId: 'album-1',
    });

    expect(db.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          type: 'ALBUM_PURCHASE',
          amount: 2000,
          productId: 'album-1',
          paymentProvider: 'PAWAPAY',
        }),
      }),
    );
  });
});

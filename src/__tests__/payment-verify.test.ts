import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { checkDepositStatus as pawapayStatus } from '@/lib/pawapay';

const TEST_USER = { sub: 'user-1', email: 'test@test.com', role: 'LISTENER', isPremium: false };

function mockDb(overrides: Record<string, unknown> = {}) {
  Object.assign(db, {
    transaction: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    subscription: { create: vi.fn() },
    purchase: { create: vi.fn() },
    album: { findUnique: vi.fn(), update: vi.fn() },
    ticket: { create: vi.fn() },
    concert: { findUnique: vi.fn(), update: vi.fn() },
    artist: { update: vi.fn() },
    $transaction: vi.fn((cb: Function) => cb(db)),
    ...overrides,
  });
}

async function callVerify(transactionId: string) {
  const { GET } = await import('@/app/api/payment/verify/route');
  const url = `http://localhost:3000/api/payment/verify?transactionId=${transactionId}`;
  return GET(new Request(url));
}

describe('Payment Verify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb();
    vi.mocked(getCurrentUser).mockResolvedValue(TEST_USER);
  });

  describe('fulfillTransaction — SUBSCRIPTION', () => {
    const baseTransaction = {
      id: 'tx-1',
      userId: 'user-1',
      type: 'SUBSCRIPTION',
      amount: 5000,
      status: 'PENDING',
      productId: 'premium',
      providerTransactionId: 'dep-1',
      metadata: null,
      user: { id: 'user-1', email: 'test@test.com' },
    };

    it('creates subscription and sets user as premium', async () => {
      vi.mocked(db.transaction.findUnique).mockResolvedValue(baseTransaction);
      vi.mocked(pawapayStatus).mockResolvedValue({
        depositId: 'dep-1',
        status: 'COMPLETED',
        amount: '5000',
      });
      vi.mocked(db.$transaction).mockImplementation(async (cb: Function) => {
        await cb(db);
      });

      const res = await callVerify('tx-1');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.transaction.status).toBe('PAID');
      expect(db.subscription.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            amount: 5000,
            status: 'ACTIVE',
          }),
        }),
      );
      expect(db.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            isPremium: true,
          }),
        }),
      );
    });

    it('returns 200 with processing:true when PawaPay returns PROCESSING', async () => {
      vi.mocked(db.transaction.findUnique).mockResolvedValue(baseTransaction);
      vi.mocked(pawapayStatus).mockResolvedValue({
        depositId: 'dep-1',
        status: 'PROCESSING',
      });

      const res = await callVerify('tx-1');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.processing).toBe(true);
      expect(data.transaction.status).toBe('PENDING');
    });

    it('returns PAID when PawaPay returns COMPLETED', async () => {
      vi.mocked(db.transaction.findUnique).mockResolvedValue(baseTransaction);
      vi.mocked(pawapayStatus).mockResolvedValue({
        depositId: 'dep-1',
        status: 'COMPLETED',
        amount: '5000',
      });

      const res = await callVerify('tx-1');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.transaction.status).toBe('PAID');
    });

    it('returns FAILED when PawaPay returns FAILED', async () => {
      vi.mocked(db.transaction.findUnique).mockResolvedValue(baseTransaction);
      vi.mocked(pawapayStatus).mockResolvedValue({
        depositId: 'dep-1',
        status: 'FAILED',
      });

      const res = await callVerify('tx-1');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.transaction.status).toBe('FAILED');
    });

    it('short-circuits if already PAID', async () => {
      vi.mocked(db.transaction.findUnique).mockResolvedValue({
        ...baseTransaction,
        status: 'PAID',
      });

      const res = await callVerify('tx-1');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.transaction.status).toBe('PAID');
      expect(pawapayStatus).not.toHaveBeenCalled();
    });
  });

  describe('fulfillTransaction — ALBUM_PURCHASE', () => {
    const baseTransaction = {
      id: 'tx-2',
      userId: 'user-1',
      type: 'ALBUM_PURCHASE',
      amount: 2000,
      status: 'PENDING',
      productId: 'album-1',
      providerTransactionId: 'dep-2',
      metadata: null,
      user: null,
    };

    it('creates purchase and increments artist balance', async () => {
      vi.mocked(db.transaction.findUnique).mockResolvedValue(baseTransaction);
      vi.mocked(db.album.findUnique).mockResolvedValue({ artistId: 'artist-1' } as any);
      vi.mocked(db.$transaction).mockImplementation(async (cb: Function) => {
        await cb(db);
      });

      vi.mocked(pawapayStatus).mockResolvedValue({
        depositId: 'dep-2',
        status: 'COMPLETED',
        amount: '2000',
      });

      const res = await callVerify('tx-2');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.transaction.status).toBe('PAID');
      expect(db.purchase.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            albumId: 'album-1',
            amount: 2000,
          }),
        }),
      );
      expect(db.artist.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'artist-1' },
          data: { balance: { increment: 1700 } },
        }),
      );
    });
  });

  describe('fulfillTransaction — TICKET_PURCHASE', () => {
    const baseTransaction = {
      id: 'tx-3',
      userId: 'user-1',
      type: 'TICKET_PURCHASE',
      amount: 10000,
      status: 'PENDING',
      productId: 'concert-1:VIP:2',
      providerTransactionId: 'dep-3',
      metadata: JSON.stringify({ recipientEmail: 'buyer@test.com' }),
      user: { id: 'user-1', email: 'test@test.com' },
    };

    it('creates tickets and decrements concert availability', async () => {
      vi.mocked(db.transaction.findUnique).mockResolvedValue(baseTransaction);
      vi.mocked(db.concert.findUnique).mockResolvedValue({ artistId: 'artist-1' } as any);
      vi.mocked(db.$transaction).mockImplementation(async (cb: Function) => {
        await cb(db);
      });
      vi.mocked(pawapayStatus).mockResolvedValue({
        depositId: 'dep-3',
        status: 'COMPLETED',
        amount: '10000',
      });

      const res = await callVerify('tx-3');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.transaction.status).toBe('PAID');
      expect(db.ticket.create).toHaveBeenCalledTimes(2);
      expect(db.concert.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'concert-1' },
          data: { vipAvailableTickets: { decrement: 2 } },
        }),
      );
      expect(db.artist.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'artist-1' },
          data: { balance: { increment: 9500 } },
        }),
      );
    });
  });

  describe('auth and validation', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);
      const res = await callVerify('tx-1');
      expect(res.status).toBe(401);
    });

    it('returns 400 when transactionId is missing', async () => {
      const { GET } = await import('@/app/api/payment/verify/route');
      const res = await GET(new Request('http://localhost:3000/api/payment/verify'));
      expect(res.status).toBe(400);
    });

    it('returns 404 when transaction not found', async () => {
      vi.mocked(db.transaction.findUnique).mockResolvedValue(null);
      const res = await callVerify('tx-unknown');
      expect(res.status).toBe(404);
    });

    it('returns 404 when transaction belongs to another user', async () => {
      vi.mocked(db.transaction.findUnique).mockResolvedValue({
        id: 'tx-other',
        userId: 'other-user',
      } as any);
      const res = await callVerify('tx-other');
      expect(res.status).toBe(404);
    });
  });
});

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PREMIUM_DOWNLOAD_QUOTA } from '@/lib/constants';
import crypto from 'crypto';

async function fulfillTransaction(transactionId: string) {
  const transaction = await db.transaction.findUnique({
    where: { id: transactionId },
    include: { user: true },
  });

  if (!transaction || transaction.status === 'PAID') return;

  await db.$transaction(async (tx) => {
    await tx.transaction.update({
      where: { id: transactionId },
      data: { status: 'PAID' },
    });

    if (transaction.type === 'SUBSCRIPTION') {
      const now = new Date();
      const monthsToAdd = transaction.productId === 'premium_subscription_12m' ? 14 : 1;
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + monthsToAdd);
      const quotaResetAt = new Date(now);
      quotaResetAt.setMonth(quotaResetAt.getMonth() + 1);

      await tx.subscription.create({
        data: {
          userId: transaction.userId,
          amount: transaction.amount,
          currency: 'XOF',
          startDate: new Date(),
          endDate,
          status: 'ACTIVE',
          transactionId,
        },
      });

      await tx.user.update({
        where: { id: transaction.userId },
        data: {
          isPremium: true,
          premiumExpiresAt: endDate,
          downloadQuota: PREMIUM_DOWNLOAD_QUOTA,
          downloadsUsedThisMonth: 0,
          quotaResetAt,
        },
      });
    } else if (transaction.type === 'ALBUM_PURCHASE') {
      await tx.purchase.create({
        data: {
          userId: transaction.userId,
          albumId: transaction.productId,
          transactionId,
          amount: transaction.amount,
          currency: 'XOF',
        },
      });

      await tx.album.update({
        where: { id: transaction.productId },
        data: { purchaseCount: { increment: 1 } },
      });

      const album = await tx.album.findUnique({
        where: { id: transaction.productId },
        select: { artistId: true },
      });

      if (album) {
        const artistShare = Math.floor(transaction.amount * 0.85);
        await tx.artist.update({
          where: { id: album.artistId },
          data: { balance: { increment: artistShare } },
        });
      }
    } else if (transaction.type === 'TICKET_PURCHASE') {
      const parts = transaction.productId.split(':');
      const concertId = parts[0];
      const ticketType = parts[1] as 'STANDARD' | 'VIP' | 'VVIP';
      const quantity = parseInt(parts[2] || '1', 10);
      let recipientEmail: string | null = null;
      try {
        const meta = transaction.metadata ? JSON.parse(transaction.metadata) : null;
        recipientEmail = meta?.recipientEmail || null;
      } catch {}
      const userEmail = transaction.user?.email || null;

      for (let i = 0; i < quantity; i++) {
        const qrCode = crypto.randomUUID();
        await tx.ticket.create({
          data: {
            concertId,
            userId: transaction.userId,
            type: ticketType,
            price: Math.floor(transaction.amount / quantity),
            qrCode,
            status: 'PURCHASED',
            recipientEmail: recipientEmail || userEmail,
          },
        });
      }

      if (ticketType === 'VVIP') {
        await tx.concert.update({
          where: { id: concertId },
          data: { vvipAvailableTickets: { decrement: quantity } },
        });
      } else if (ticketType === 'VIP') {
        await tx.concert.update({
          where: { id: concertId },
          data: { vipAvailableTickets: { decrement: quantity } },
        });
      } else {
        await tx.concert.update({
          where: { id: concertId },
          data: { availableTickets: { decrement: quantity } },
        });
      }

      const concert = await tx.concert.findUnique({
        where: { id: concertId },
        select: { artistId: true },
      });

      if (concert) {
        const artistShare = Math.floor(transaction.amount * 0.95);
        await tx.artist.update({
          where: { id: concert.artistId },
          data: { balance: { increment: artistShare } },
        });
      }
    }
  });

  if (transaction.type === 'SUBSCRIPTION') {
    const { awardReferralCommission } = await import('@/lib/commission');
    await awardReferralCommission(transaction.userId, transaction.amount, transactionId);
  }

  if (transaction.type === 'TICKET_PURCHASE') {
    const parts = transaction.productId.split(':');
    const concertId = parts[0];
    const ticketType = parts[1];
    const quantity = parseInt(parts[2] || '1', 10);

    const concert = await db.concert.findUnique({ where: { id: concertId } });
    const tickets = await db.ticket.findMany({
      where: { userId: transaction.userId, concertId, status: 'PURCHASED' },
      orderBy: { purchasedAt: 'desc' },
      take: quantity,
    });

    if (concert && tickets.length > 0) {
      let recipientEmail: string | null = null;
      try {
        const meta = transaction.metadata ? JSON.parse(transaction.metadata) : null;
        recipientEmail = meta?.recipientEmail || null;
      } catch {}
      const email = recipientEmail || transaction.user?.email;
      if (email) {
        const { sendTicketEmail } = await import('@/lib/email');
        await sendTicketEmail({
          email,
          userName: transaction.user?.displayName || email.split('@')[0],
          concertTitle: concert.title,
          venue: concert.venue,
          city: concert.city,
          date: concert.date.toISOString(),
          time: concert.time,
          ticketType,
          quantity: tickets.length,
          totalAmount: transaction.amount,
          qrCodes: tickets.map((t) => t.qrCode),
          transactionId,
        });
      }
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // PawaPay webhook — deposit status callback
    if (body.depositId && body.status) {
      const rawBody = await request.clone().text();
      const signature = request.headers.get('x-pawapay-signature') || '';
      const pawapayApiKey = process.env.PAWAPAY_API_KEY || '';
      if (pawapayApiKey) {
        const expectedSig = crypto
          .createHmac('sha256', pawapayApiKey)
          .update(rawBody)
          .digest('hex');
        if (signature !== expectedSig) {
          return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
        }
      }

      const depositId = body.depositId as string;
      const status = body.status as string;

      const txn = await db.transaction.findFirst({
        where: { providerTransactionId: depositId },
      });

      if (status === 'COMPLETED' && txn && txn.status !== 'PAID') {
        await fulfillTransaction(txn.id);
        return NextResponse.json({ message: 'Webhook PawaPay traité' });
      }

      return NextResponse.json({ message: 'Webhook PawaPay reçu (ignoré)' });
    }

    // Moneroo webhook (fallback)
    if (body.event && body.data) {
      const event = body.event as string;
      const paymentData = body.data;

      if (event === 'payment.success') {
        const paymentId = paymentData.id as string;
        if (!paymentId) {
          return NextResponse.json({ error: 'ID de paiement manquant' }, { status: 400 });
        }

        const config = await db.paymentProviderConfig.findUnique({
          where: { provider: 'MONEROO' },
        });
        const webhookSecret = config?.siteId || process.env.MONEROO_WEBHOOK_SECRET || '';
        if (webhookSecret) {
          const signature = request.headers.get('x-moneroo-signature') || '';
          const rawBody = await request.clone().text();
          const expectedSig = crypto
            .createHmac('sha256', webhookSecret)
            .update(rawBody)
            .digest('hex');
          if (signature !== expectedSig) {
            return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
          }
        }

        const txn = await db.transaction.findFirst({
          where: { providerTransactionId: paymentId },
        });
        if (txn && txn.status !== 'PAID') {
          await fulfillTransaction(txn.id);
        }

        return NextResponse.json({ message: 'Webhook Moneroo traité' });
      }

      return NextResponse.json({ message: 'Événement ignoré' });
    }

    return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    );
  }
}

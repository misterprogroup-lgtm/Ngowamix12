import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySignature as cinetpayVerify } from '@/lib/cinetpay';
import { constructWebhookEvent } from '@/lib/stripe';
import { PREMIUM_PRICE, PREMIUM_DOWNLOAD_QUOTA } from '@/lib/constants';
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
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      const quotaResetAt = new Date();
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
      const ticketType = parts[1] as 'STANDARD' | 'VIP';
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

      if (ticketType === 'VIP') {
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
}

export async function POST(request: Request) {
  try {
    const stripeSignature = request.headers.get('stripe-signature');

    if (stripeSignature) {
      const payload = await request.text();
      const event = constructWebhookEvent(payload, stripeSignature);
      if (!event) {
        return NextResponse.json({ error: 'Signature Stripe invalide' }, { status: 400 });
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const txnId = session.metadata?.transaction_id;
        if (txnId && session.payment_status === 'paid') {
          await fulfillTransaction(txnId);
        }
      }

      return NextResponse.json({ message: 'Webhook Stripe traité' });
    }

    const body = await request.json();
    const contentType = request.headers.get('content-type') || '';

    if (body.event && body.data) {
      const config = await db.paymentProviderConfig.findUnique({
        where: { provider: 'MONEROO' },
        select: { apiKey: true },
      });

      const expectedSig = crypto
        .createHmac('sha256', config?.apiKey || process.env.MONEROO_WEBHOOK_SECRET || '')
        .update(JSON.stringify(body))
        .digest('hex');
      const receivedSig = request.headers.get('x-moneroo-signature') || '';
      if (receivedSig !== expectedSig) {
        return NextResponse.json({ error: 'Signature Moneroo invalide' }, { status: 400 });
      }

      const txnId = body.data.metadata?.transaction_id || body.data.reference;
      if (body.event === 'checkout.completed' && body.data?.status === 'SUCCESS') {
        await fulfillTransaction(txnId);
      }

      return NextResponse.json({ message: 'Webhook Moneroo traité' });
    }

    if (!cinetpayVerify(body)) {
      return NextResponse.json({ error: 'Signature CinetPay invalide' }, { status: 400 });
    }

    const txnId = body.transaction_id;
    if (body.status === 'ACCEPTED' || body.status === 'PAID') {
      await fulfillTransaction(txnId);
    } else {
      await db.transaction.update({
        where: { id: txnId },
        data: { status: 'FAILED' },
      });
    }

    return NextResponse.json({ message: 'Webhook CinetPay traité' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    );
  }
}

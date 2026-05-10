import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySignature, checkPaymentStatus } from '@/lib/cinetpay';
import { PREMIUM_PRICE, PREMIUM_DOWNLOAD_QUOTA } from '@/lib/constants';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!verifySignature(body)) {
      return NextResponse.json(
        { error: 'Signature invalide' },
        { status: 400 }
      );
    }

    const { transaction_id, status, amount, currency } = body;

    const transaction = await db.transaction.findUnique({
      where: { id: transaction_id },
      include: { user: true },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction non trouvée' },
        { status: 404 }
      );
    }

    if (transaction.status === 'PAID') {
      return NextResponse.json({ message: 'Transaction déjà traitée' });
    }

    if (status === 'ACCEPTED' || status === 'PAID') {
      await db.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction_id },
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
              transactionId: transaction_id,
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
              transactionId: transaction_id,
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
    } else {
      await db.transaction.update({
        where: { id: transaction_id },
        data: { status: 'FAILED' },
      });
    }

    return NextResponse.json({ message: 'Webhook traité' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    );
  }
}

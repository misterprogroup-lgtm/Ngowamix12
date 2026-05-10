import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { checkPaymentStatus } from '@/lib/cinetpay';
import { PREMIUM_DOWNLOAD_QUOTA } from '@/lib/constants';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json(
        { error: 'transactionId requis' },
        { status: 400 }
      );
    }

    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!transaction || transaction.userId !== user.sub) {
      return NextResponse.json(
        { error: 'Transaction non trouvée' },
        { status: 404 }
      );
    }

    if (transaction.status === 'PAID') {
      return NextResponse.json({
        transaction: {
          id: transaction.id,
          status: transaction.status,
          type: transaction.type,
          amount: transaction.amount,
          productId: transaction.productId,
        },
        message: 'Paiement confirmé',
      });
    }

    const statusResponse = await checkPaymentStatus(transaction.providerTransactionId || transactionId);

    if (statusResponse.data?.status === 'ACCEPTED' || statusResponse.data?.status === 'PAID') {
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
              userId: user.sub,
              amount: transaction.amount,
              currency: 'XOF',
              startDate: new Date(),
              endDate,
              status: 'ACTIVE',
              transactionId: transactionId,
            },
          });

          await tx.user.update({
            where: { id: user.sub },
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
              userId: user.sub,
              albumId: transaction.productId,
              transactionId: transactionId,
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

          for (let i = 0; i < quantity; i++) {
            const qrCode = crypto.randomUUID();
            await tx.ticket.create({
              data: {
                concertId,
                userId: user.sub,
                type: ticketType,
                price: Math.floor(transaction.amount / quantity),
                qrCode,
                status: 'PURCHASED',
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

      return NextResponse.json({
        transaction: {
          id: transaction.id,
          status: 'PAID',
          type: transaction.type,
          amount: transaction.amount,
          productId: transaction.productId,
        },
        message: 'Paiement confirmé',
      });
    }

    return NextResponse.json({
      transaction: {
        id: transaction.id,
        status: transaction.status,
        type: transaction.type,
      },
      message: 'Paiement en attente',
    });
  } catch (error) {
    console.error('Payment check error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du paiement' },
      { status: 500 }
    );
  }
}

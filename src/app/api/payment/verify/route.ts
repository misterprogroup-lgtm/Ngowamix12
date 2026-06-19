import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { checkDepositStatus as pawapayStatus } from '@/lib/pawapay';
import { PREMIUM_DOWNLOAD_QUOTA } from '@/lib/constants';
import crypto from 'crypto';

async function fulfillTransaction(transactionId: string, userId: string) {
  const transaction = await db.transaction.findUnique({
    where: { id: transactionId },
    include: { user: true },
  });

  if (!transaction || transaction.status === 'PAID' || transaction.userId !== userId) return false;

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
          userId,
          amount: transaction.amount,
          currency: 'XOF',
          startDate: new Date(),
          endDate,
          status: 'ACTIVE',
          transactionId,
        },
      });

      await tx.user.update({
        where: { id: userId },
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
          userId,
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
            userId,
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
    } else if (transaction.type === 'TIP') {
      const artistShare = Math.floor(transaction.amount * 0.95);
      await tx.artist.update({
        where: { id: transaction.productId },
        data: { balance: { increment: artistShare } },
      });
    }
  });

  if (transaction?.type === 'SUBSCRIPTION') {
    const { awardReferralCommission } = await import('@/lib/commission');
    await awardReferralCommission(userId, transaction.amount, transactionId);
  }

  if (transaction?.type === 'TICKET_PURCHASE') {
    const parts = transaction.productId.split(':');
    const concertId = parts[0];
    const ticketType = parts[1];
    const quantity = parseInt(parts[2] || '1', 10);

    const concert = await db.concert.findUnique({ where: { id: concertId } });
    const tickets = await db.ticket.findMany({
      where: { userId, concertId, status: 'PURCHASED' },
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

  return true;
}

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

    let isPaid = false;
    let pawapayResult: Awaited<ReturnType<typeof pawapayStatus>> | null = null;
    const depositId = transaction.providerTransactionId;

    if (depositId) {
      try {
        pawapayResult = await pawapayStatus(depositId);
        isPaid = pawapayResult.status === 'COMPLETED';
      } catch {
        pawapayResult = null;
      }
    }

    if (isPaid) {
      await fulfillTransaction(transactionId, user.sub);

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

    if (!pawapayResult) {
      if (depositId && transaction.type === 'TICKET_PURCHASE') {
        const age = Date.now() - new Date(transaction.createdAt).getTime();
        if (age > 30000) {
          await fulfillTransaction(transactionId, user.sub);
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
      }
      return NextResponse.json({
        transaction: {
          id: transaction.id,
          status: transaction.status,
          type: transaction.type,
        },
        processing: true,
        message: 'Vérification du paiement en cours...',
      });
    }

    if (pawapayResult.status === 'PROCESSING') {
      const age = Date.now() - new Date(transaction.createdAt).getTime();
      if (age > 120000 && transaction.type === 'TICKET_PURCHASE') {
        await fulfillTransaction(transactionId, user.sub);
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
          status: 'PENDING',
          type: transaction.type,
        },
        processing: true,
        message: 'Paiement en cours de traitement...',
      });
    }

    if (pawapayResult.status === 'FAILED' || pawapayResult.status === 'IN_RECONCILIATION') {
      return NextResponse.json({
        transaction: {
          id: transaction.id,
          status: 'FAILED',
          type: transaction.type,
        },
        message: 'Paiement échoué',
      });
    }

    return NextResponse.json({
      transaction: {
        id: transaction.id,
        status: transaction.status,
        type: transaction.type,
      },
      processing: true,
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

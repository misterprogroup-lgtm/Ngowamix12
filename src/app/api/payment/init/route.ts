import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { initPaymentPage, generateDepositId } from '@/lib/pawapay';
import { z } from 'zod';
import { APP_BASE_URL } from '@/lib/constants';

const paymentSchema = z.object({
  amount: z.number().positive(),
  originalAmount: z.number().positive().optional(),
  description: z.string(),
  type: z.enum(['SUBSCRIPTION', 'ALBUM_PURCHASE', 'TICKET_PURCHASE', 'TIP']),
  productId: z.string(),
  recipientEmail: z.string().email().optional(),
  promoCodeId: z.string().optional(),
  promoCode: z.string().optional(),
  country: z.string().min(2).max(3).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = paymentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { amount, originalAmount, description, type, productId, recipientEmail, promoCodeId, promoCode: promoCodeStr, country } = result.data;

    if (type === 'TIP') {
      const artist = await db.artist.findUnique({ where: { id: productId } });
      if (!artist) {
        return NextResponse.json(
          { error: 'Artiste introuvable' },
          { status: 404 }
        );
      }
      if (amount < 100) {
        return NextResponse.json(
          { error: 'Montant minimum : 100 F CFA' },
          { status: 400 }
        );
      }
    }

    if (type === 'SUBSCRIPTION') {
      const siteConfig = await db.siteConfig.findUnique({ where: { id: 'default' } });
      const monthlyPrice = siteConfig?.premiumPrice ?? 1500;

      if (productId === 'premium_subscription_12m') {
        const annualPrice = monthlyPrice * 12;
        if (amount !== annualPrice && (!originalAmount || originalAmount !== annualPrice)) {
          return NextResponse.json(
            { error: 'Montant invalide pour l\'abonnement annuel' },
            { status: 400 }
          );
        }
      } else {
        if (amount !== monthlyPrice && (!originalAmount || originalAmount !== monthlyPrice)) {
          return NextResponse.json(
            { error: 'Montant invalide' },
            { status: 400 }
          );
        }
      }
    }

    if (type === 'TICKET_PURCHASE') {
      const parts = productId.split(':');
      if (parts.length !== 3) {
        return NextResponse.json(
          { error: 'Format de produit invalide' },
          { status: 400 }
        );
      }
      const [concertId, ticketType, qtyStr] = parts;
      const qty = parseInt(qtyStr, 10);
      if (!qty || qty < 1 || qty > 20) {
        return NextResponse.json(
          { error: 'Quantité invalide' },
          { status: 400 }
        );
      }
      const concert = await db.concert.findUnique({ where: { id: concertId } });
      if (!concert) {
        return NextResponse.json(
          { error: 'Concert introuvable' },
          { status: 404 }
        );
      }
      const available = ticketType === 'VIP'
        ? concert.vipAvailableTickets
        : ticketType === 'VVIP'
        ? concert.vvipAvailableTickets
        : concert.availableTickets;
      if (qty > available) {
        return NextResponse.json(
          { error: `Seulement ${available} place(s) disponible(s)` },
          { status: 400 }
        );
      }
      const unitPrice = ticketType === 'VIP'
        ? (concert.vipPrice ?? concert.price)
        : ticketType === 'VVIP'
        ? (concert.vvipPrice ?? concert.price)
        : concert.price;
      if (amount !== unitPrice * qty) {
        return NextResponse.json(
          { error: 'Montant invalide' },
          { status: 400 }
        );
      }
    }

    const depositId = generateDepositId();

    const transaction = await db.transaction.create({
      data: {
        userId: user.sub,
        type: type as never,
        amount,
        currency: 'XOF',
        status: 'PENDING',
        paymentMethod: 'MOBILE_MONEY',
        paymentProvider: 'PAWAPAY',
        providerTransactionId: depositId,
        productId,
        metadata: type === 'TICKET_PURCHASE' && recipientEmail
          ? JSON.stringify({ recipientEmail })
          : null,
      },
    });

    const returnUrl = type === 'SUBSCRIPTION'
      ? `${APP_BASE_URL}/premium?transactionId=${transaction.id}`
      : type === 'TICKET_PURCHASE'
        ? `${APP_BASE_URL}/tickets/success?transactionId=${transaction.id}`
        : type === 'TIP'
          ? `${APP_BASE_URL}/purchase/success?transactionId=${transaction.id}`
          : `${APP_BASE_URL}/purchase/success?transactionId=${transaction.id}`;

    const pawapayResult = await initPaymentPage({
      depositId,
      returnUrl,
      amountDetails: {
        amount: amount.toString(),
        currency: 'XOF',
      },
      country: country || process.env.PAWAPAY_DEFAULT_COUNTRY || 'CIV',
      reason: description,
      language: 'fr',
    });

    if (!pawapayResult.redirectUrl) {
      throw new Error('Erreur lors de l\'initialisation du paiement Pawapay');
    }

    if (promoCodeId) {
      const promo = await db.promoCode.findUnique({ where: { id: promoCodeId } });
      if (promo) {
        await db.promoCode.update({
          where: { id: promoCodeId },
          data: { currentUses: { increment: 1 } },
        });
        await db.usedPromoCode.create({
          data: {
            promoCodeId,
            userId: user.sub,
            transactionId: transaction.id,
            discountAmount: (originalAmount || amount) - amount,
          },
        });
      }
    }

    return NextResponse.json({
      transactionId: transaction.id,
      paymentUrl: pawapayResult.redirectUrl,
      message: 'Paiement initié',
    });
  } catch (error) {
    console.error('Payment init error:', error);
    const message = error instanceof Error ? error.message : 'Erreur lors de l\'initialisation du paiement';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

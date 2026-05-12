import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { initPayment as cinetpayInit, generateTransactionId as cinetpayTid, isCinetpayActive } from '@/lib/cinetpay';
import { initPayment as monerooInit, generateTransactionId as monerooTid, isMonerooActive } from '@/lib/moneroo';
import { createCheckoutSession, isStripeActive } from '@/lib/stripe';
import { z } from 'zod';

const paymentSchema = z.object({
  amount: z.number().positive(),
  description: z.string(),
  type: z.enum(['SUBSCRIPTION', 'ALBUM_PURCHASE', 'TICKET_PURCHASE']),
  productId: z.string(),
  paymentMethod: z.enum(['MOBILE_MONEY', 'CARD', 'STRIPE']).default('MOBILE_MONEY'),
  provider: z.enum(['CINETPAY', 'MONEROO', 'STRIPE']).optional(),
  recipientEmail: z.string().email().optional(),
});

function generateTransactionId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`.toUpperCase();
}

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

    const { amount, description, type, productId, paymentMethod, provider, recipientEmail } = result.data;

    let selectedProvider = provider || '';

    if (!selectedProvider) {
      const stripeActive = await isStripeActive();
      const monerooActive = await isMonerooActive();
      const cinetpayActive = await isCinetpayActive();

      if (paymentMethod === 'CARD' && stripeActive) {
        selectedProvider = 'STRIPE';
      } else if (monerooActive) {
        selectedProvider = 'MONEROO';
      } else if (cinetpayActive) {
        selectedProvider = 'CINETPAY';
      } else if (stripeActive) {
        selectedProvider = 'STRIPE';
      } else {
        return NextResponse.json(
          { error: 'Aucun moyen de paiement disponible' },
          { status: 503 }
        );
      }
    } else if (selectedProvider === 'CINETPAY') {
      const active = await isCinetpayActive();
      if (!active) {
        return NextResponse.json(
          { error: 'CinetPay est temporairement indisponible' },
          { status: 503 }
        );
      }
    } else if (selectedProvider === 'MONEROO') {
      const active = await isMonerooActive();
      if (!active) {
        return NextResponse.json(
          { error: 'Moneroo est temporairement indisponible' },
          { status: 503 }
        );
      }
    } else if (selectedProvider === 'STRIPE') {
      const active = await isStripeActive();
      if (!active) {
        return NextResponse.json(
          { error: 'Stripe est temporairement indisponible' },
          { status: 503 }
        );
      }
    }

    if (type === 'SUBSCRIPTION') {
      const siteConfig = await db.siteConfig.findUnique({ where: { id: 'default' } });
      const expectedPrice = siteConfig?.premiumPrice ?? 5000;
      if (amount !== expectedPrice) {
        return NextResponse.json(
          { error: 'Montant invalide' },
          { status: 400 }
        );
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
      const available = ticketType === 'VIP' ? concert.vipAvailableTickets : concert.availableTickets;
      if (qty > available) {
        return NextResponse.json(
          { error: `Seulement ${available} place(s) disponible(s)` },
          { status: 400 }
        );
      }
      const unitPrice = ticketType === 'VIP' ? (concert.vipPrice ?? concert.price) : concert.price;
      if (amount !== unitPrice * qty) {
        return NextResponse.json(
          { error: 'Montant invalide' },
          { status: 400 }
        );
      }
    }

    const tId = generateTransactionId(selectedProvider === 'STRIPE' ? 'STR' : selectedProvider === 'MONEROO' ? 'MON' : 'AFS');

    const meta = type === 'TICKET_PURCHASE' && recipientEmail
      ? JSON.stringify({ recipientEmail })
      : null;

    const transaction = await db.transaction.create({
      data: {
        userId: user.sub,
        type: type as never,
        amount,
        currency: 'XOF',
        status: 'PENDING',
        paymentMethod: selectedProvider === 'STRIPE' ? 'CARD' : (paymentMethod as never),
        paymentProvider: selectedProvider as never,
        providerTransactionId: tId,
        productId,
        metadata: meta,
      },
    });

    const userDb = await db.user.findUnique({
      where: { id: user.sub },
      select: { firstName: true, lastName: true, email: true },
    });

    const returnUrl = type === 'SUBSCRIPTION'
      ? `${process.env.APP_URL}/premium?transactionId=${transaction.id}`
      : type === 'TICKET_PURCHASE'
        ? `${process.env.APP_URL}/tickets/success?transactionId=${transaction.id}`
        : `${process.env.APP_URL}/purchase/success?transactionId=${transaction.id}`;

    let paymentUrl: string | undefined;

    if (selectedProvider === 'CINETPAY') {
      const channels = paymentMethod === 'MOBILE_MONEY' ? 'MOBILE_MONEY' : 'CARD';
      const paymentData = await cinetpayInit({
        amount,
        currency: 'XOF',
        transaction_id: transaction.id,
        description,
        customer_name: userDb?.firstName || '',
        customer_surname: userDb?.lastName || '',
        customer_email: user.email,
        customer_phone_number: '',
        channels,
        return_url: returnUrl,
        notify_url: `${process.env.APP_URL}/api/payment/webhook`,
        lang: 'fr',
      });

      if (paymentData.code !== '00') {
        return NextResponse.json(
          { error: paymentData.description || 'Erreur CinetPay' },
          { status: 400 }
        );
      }
      paymentUrl = paymentData.data?.payment_url;
    } else if (selectedProvider === 'MONEROO') {
      const [firstName, ...rest] = (userDb?.firstName || user.email).split(' ');
      const lastName = userDb?.lastName || rest.join(' ') || '';

      const paymentData = await monerooInit({
        amount,
        currency: 'XOF',
        description,
        customer: {
          email: user.email,
          first_name: firstName || user.email,
          last_name: lastName || 'User',
        },
        metadata: { transaction_id: transaction.id },
        return_url: returnUrl,
      });

      if (paymentData.data?.checkout_url) {
        paymentUrl = paymentData.data.checkout_url;
        if (paymentData.data.id) {
          await db.transaction.update({
            where: { id: transaction.id },
            data: { providerTransactionId: paymentData.data.id },
          });
        }
      } else {
        throw new Error(paymentData.message || 'Réponse Moneroo invalide');
      }
    } else if (selectedProvider === 'STRIPE') {
      const result = await createCheckoutSession({
        amount,
        currency: 'XOF',
        transactionId: transaction.id,
        description,
        customerEmail: user.email,
        successUrl: returnUrl,
        cancelUrl: `${process.env.APP_URL}/payment?cancelled=1`,
      });

      if (result.error) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }
      paymentUrl = result.url || undefined;
    }

    return NextResponse.json({
      transactionId: transaction.id,
      paymentUrl,
      message: 'Paiement initié',
    });
  } catch (error) {
    console.error('Payment init error:', error);
    const message = error instanceof Error ? error.message : 'Erreur lors de l\'initialisation du paiement';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

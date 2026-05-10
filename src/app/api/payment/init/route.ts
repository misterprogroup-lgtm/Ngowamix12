import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { initPayment, generateTransactionId, isCinetpayActive } from '@/lib/cinetpay';
import { z } from 'zod';

const paymentSchema = z.object({
  amount: z.number().positive(),
  description: z.string(),
  type: z.enum(['SUBSCRIPTION', 'ALBUM_PURCHASE', 'TICKET_PURCHASE']),
  productId: z.string(),
  paymentMethod: z.enum(['MOBILE_MONEY', 'CARD', 'STRIPE']).default('MOBILE_MONEY'),
  recipientEmail: z.string().email().optional(),
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

    const { amount, description, type, productId, paymentMethod, recipientEmail } = result.data;

    if (paymentMethod === 'STRIPE') {
      return NextResponse.json(
        { error: 'Stripe sera disponible prochainement' },
        { status: 400 }
      );
    }

    const cinetpayActive = await isCinetpayActive();
    if (!cinetpayActive) {
      return NextResponse.json(
        { error: 'Le paiement par mobile money est temporairement indisponible' },
        { status: 503 }
      );
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

    const transactionId = generateTransactionId();

    const metadata = type === 'TICKET_PURCHASE' && recipientEmail
      ? JSON.stringify({ recipientEmail })
      : null;

    const transaction = await db.transaction.create({
      data: {
        userId: user.sub,
        type: type as never,
        amount,
        currency: 'XOF',
        status: 'PENDING',
        paymentMethod: paymentMethod as never,
        paymentProvider: 'CINETPAY',
        providerTransactionId: transactionId,
        productId,
        metadata,
      },
    });

    const userDb = await db.user.findUnique({
      where: { id: user.sub },
      select: { firstName: true, lastName: true, email: true },
    });

    const channels = paymentMethod === 'MOBILE_MONEY' ? 'MOBILE_MONEY' : 'CARD';

    const returnUrl = type === 'SUBSCRIPTION'
      ? `${process.env.APP_URL}/premium?transactionId=${transaction.id}`
      : type === 'TICKET_PURCHASE'
        ? `${process.env.APP_URL}/tickets/success?transactionId=${transaction.id}`
        : `${process.env.APP_URL}/purchase/success?transactionId=${transaction.id}`;

    const paymentData = await initPayment({
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
        { error: paymentData.description || 'Erreur lors de l\'initialisation du paiement' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      transactionId: transaction.id,
      paymentUrl: paymentData.data?.payment_url,
      message: 'Paiement initié',
    });
  } catch (error) {
    console.error('Payment init error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'initialisation du paiement' },
      { status: 500 }
    );
  }
}

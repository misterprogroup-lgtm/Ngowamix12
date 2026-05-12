import Stripe from 'stripe';
import { db } from '@/lib/db';

let client: Stripe | null = null;

function getClient(): Stripe | null {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client = new Stripe(key, { apiVersion: '2026-04-22.dahlia' });
  return client;
}

export async function isStripeActive(): Promise<boolean> {
  const config = await db.paymentProviderConfig.findUnique({
    where: { provider: 'STRIPE' },
    select: { isActive: true, apiKey: true },
  });
  if (config) return config.isActive && !!config.apiKey;
  return !!process.env.STRIPE_SECRET_KEY;
}

export async function createCheckoutSession(params: {
  amount: number;
  currency: string;
  transactionId: string;
  description: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string | null; error?: string }> {
  const stripe = getClient();
  if (!stripe) return { url: null, error: 'Stripe non configuré' };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: params.currency.toLowerCase(),
            product_data: {
              name: params.description,
            },
            unit_amount: params.amount,
          },
          quantity: 1,
        },
      ],
      metadata: { transaction_id: params.transactionId },
      customer_email: params.customerEmail,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });

    return { url: session.url };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur Stripe';
    return { url: null, error: msg };
  }
}

export async function retrieveSession(sessionId: string) {
  const stripe = getClient();
  if (!stripe) return null;
  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return null;
  }
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event | null {
  const stripe = getClient();
  if (!stripe) return null;
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch {
    return null;
  }
}

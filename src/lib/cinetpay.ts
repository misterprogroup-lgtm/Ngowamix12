import crypto from 'crypto';
import { db } from '@/lib/db';

const CINETPAY_API_URL = 'https://api-checkout.cinetpay.com/v2/payment';

async function getConfig() {
  const config = await db.paymentProviderConfig.findUnique({
    where: { provider: 'CINETPAY' },
  });
  return {
    apiKey: config?.apiKey || process.env.CINETPAY_API_KEY || '',
    siteId: config?.siteId || process.env.CINETPAY_SITE_ID || '',
    isActive: config?.isActive ?? true,
  };
}

export interface CinetPayInitRequest {
  amount: number;
  currency: string;
  transaction_id: string;
  description: string;
  customer_name: string;
  customer_surname: string;
  customer_email: string;
  customer_phone_number: string;
  channels: string;
  return_url: string;
  notify_url: string;
  lang: string;
}

export interface CinetPayResponse {
  code: string;
  description: string;
  data?: {
    payment_url: string;
    transaction_id: string;
    operator_id: string;
  };
}

export interface CinetPayStatusResponse {
  code: string;
  description: string;
  data?: {
    status: string;
    amount: number;
    currency: string;
    payment_date: string;
    operator_id: string;
    method: string;
  };
}

export async function initPayment(params: CinetPayInitRequest): Promise<CinetPayResponse> {
  const { apiKey, siteId } = await getConfig();

  const signature = crypto
    .createHash('sha256')
    .update(`${apiKey}${siteId}${params.transaction_id}${params.amount}${params.currency}${params.description}${params.customer_name}${params.customer_surname}${params.customer_email}${params.customer_phone_number}`)
    .digest('hex');

  const response = await fetch(CINETPAY_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apikey: apiKey,
      site_id: siteId,
      ...params,
      signature,
    }),
  });

  return response.json();
}

export async function checkPaymentStatus(transactionId: string): Promise<CinetPayStatusResponse> {
  const { apiKey, siteId } = await getConfig();

  const signature = crypto
    .createHash('sha256')
    .update(`${apiKey}${siteId}${transactionId}`)
    .digest('hex');

  const response = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apikey: apiKey,
      site_id: siteId,
      transaction_id: transactionId,
      signature,
    }),
  });

  return response.json();
}

export async function isCinetpayActive(): Promise<boolean> {
  const config = await db.paymentProviderConfig.findUnique({
    where: { provider: 'CINETPAY' },
    select: { isActive: true, apiKey: true, siteId: true },
  });
  if (!config) return true;
  return config.isActive && !!config.apiKey && !!config.siteId;
}

export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `AFS_${timestamp}_${random}`.toUpperCase();
}

export function verifySignature(payload: Record<string, string>): boolean {
  const { signature, apikey, transaction_id, amount, currency, status } = payload;
  const expectedSignature = crypto
    .createHash('sha256')
    .update(`${apikey}${transaction_id}${amount}${currency}${status}`)
    .digest('hex');
  return signature === expectedSignature;
}

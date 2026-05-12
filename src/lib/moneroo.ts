import { db } from '@/lib/db';
import crypto from 'crypto';

const MONEROO_API_URL = 'https://api.moneroo.io/v1';

async function getConfig() {
  const config = await db.paymentProviderConfig.findUnique({
    where: { provider: 'MONEROO' },
  });
  return {
    apiKey: config?.apiKey || process.env.MONEROO_API_KEY || '',
    isActive: config?.isActive ?? false,
  };
}

interface MonerooCustomer {
  name: string;
  email: string;
  phone?: string;
}

interface MonerooInitRequest {
  amount: number;
  currency: string;
  customer: MonerooCustomer;
  metadata?: Record<string, string>;
  callback_url: string;
  success_url: string;
  failure_url?: string;
  description?: string;
}

interface MonerooInitResponse {
  success: boolean;
  message?: string;
  data?: {
    checkout_url: string;
    reference: string;
  };
}

interface MonerooStatusResponse {
  success: boolean;
  message?: string;
  data?: {
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
    reference: string;
    amount: number;
    currency: string;
    customer: MonerooCustomer;
    paid_at?: string;
  };
}

export async function initPayment(params: MonerooInitRequest): Promise<MonerooInitResponse> {
  const { apiKey } = await getConfig();

  const response = await fetch(`${MONEROO_API_URL}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(params),
  });

  return response.json();
}

export async function checkPaymentStatus(reference: string): Promise<MonerooStatusResponse> {
  const { apiKey } = await getConfig();

  const response = await fetch(`${MONEROO_API_URL}/checkout/${reference}/status`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  return response.json();
}

export async function isMonerooActive(): Promise<boolean> {
  const config = await db.paymentProviderConfig.findUnique({
    where: { provider: 'MONEROO' },
    select: { isActive: true, apiKey: true },
  });
  if (!config) return false;
  return config.isActive && !!config.apiKey;
}

export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `MON_${timestamp}_${random}`.toUpperCase();
}

export function verifySignature(payload: Record<string, unknown>, secret: string): boolean {
  const receivedSignature = payload.signature as string;
  if (!receivedSignature) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return receivedSignature === expected;
}

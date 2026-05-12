import { db } from '@/lib/db';
import crypto from 'crypto';

const MONEROO_API = 'https://api.moneroo.io/v1/payments';

async function getConfig() {
  const config = await db.paymentProviderConfig.findUnique({
    where: { provider: 'MONEROO' },
  });
  return {
    apiKey: config?.apiKey || process.env.MONEROO_API_KEY || '',
    isActive: config?.isActive ?? false,
  };
}

interface MonerooInitRequest {
  amount: number;
  currency: string;
  description: string;
  customer: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
  };
  return_url: string;
  metadata?: Record<string, string>;
  methods?: string[];
}

interface MonerooInitResponse {
  message: string;
  data?: {
    id: string;
    checkout_url: string;
  };
}

interface MonerooStatusResponse {
  message: string;
  data?: {
    status: 'pending' | 'success' | 'failed' | 'cancelled';
    id: string;
    amount: number;
    currency: string;
    paid_at?: string;
    customer: {
      email: string;
      first_name: string;
      last_name: string;
    };
  };
}

export async function initPayment(params: MonerooInitRequest): Promise<MonerooInitResponse> {
  const { apiKey } = await getConfig();

  const response = await fetch(MONEROO_API + '/initialize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  return data as MonerooInitResponse;
}

export async function checkPaymentStatus(paymentId: string): Promise<MonerooStatusResponse> {
  const { apiKey } = await getConfig();

  const response = await fetch(`${MONEROO_API}/${paymentId}/status`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
  });

  return response.json() as Promise<MonerooStatusResponse>;
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

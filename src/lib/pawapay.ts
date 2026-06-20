import { db } from '@/lib/db';
import crypto from 'crypto';
import { logger } from '@/lib/logger';
import { tryDecrypt } from '@/lib/encrypt';

const PAWAPAY_SANDBOX_API = 'https://api.sandbox.pawapay.io';
const PAWAPAY_PRODUCTION_API = 'https://api.pawapay.io';

function getBaseUrl(): string {
  const env = process.env.PAWAPAY_ENVIRONMENT || process.env.VERCEL_ENV;
  if (env === 'production' || (process.env.PAWAPAY_API_KEY && env !== 'sandbox')) {
    return PAWAPAY_PRODUCTION_API;
  }
  return PAWAPAY_SANDBOX_API;
}

async function getConfig() {
  return {
    apiKey: process.env.PAWAPAY_API_KEY || '',
    isActive: true,
  };
}

interface PawaPayPaymentPageRequest {
  depositId: string;
  returnUrl: string;
  amountDetails?: {
    amount: string;
    currency: string;
  };
  country?: string;
  msisdn?: string;
  reason?: string;
  language?: string;
}

interface PawaPayPaymentPageResponse {
  redirectUrl: string;
}

interface PawaPayDepositStatusResponse {
  depositId: string;
  status: 'COMPLETED' | 'FAILED' | 'PROCESSING' | 'IN_RECONCILIATION';
  amount?: string;
  currency?: string;
  country?: string;
  failureReason?: {
    failureCode: string;
    failureMessage: string;
  };
  providerTransactionId?: string;
}

export async function initPaymentPage(params: PawaPayPaymentPageRequest): Promise<PawaPayPaymentPageResponse> {
  const { apiKey } = await getConfig();
  const baseUrl = getBaseUrl();

  const sanitized = Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, typeof v === 'string' ? v.replace(/[^ -~]/g, '') : v])
  );

  const bodyStr = JSON.stringify(sanitized);

  const response = await fetch(`${baseUrl}/v2/paymentpage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
    body: Buffer.from(bodyStr, 'utf-8'),
  });

  if (!response.ok) {
    const errorStatus = response.status;
    const errorBody = await response.text().catch(() => '');
    logger.error('PawaPay', `API error ${errorStatus}`, { body: errorBody.slice(0, 200) });
    throw new Error(`PawaPay API error (${errorStatus})`);
  }

  const data = await response.json();
  return data as PawaPayPaymentPageResponse;
}

export async function checkDepositStatus(depositId: string): Promise<PawaPayDepositStatusResponse> {
  const { apiKey } = await getConfig();
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/v2/deposits/${depositId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorStatus = response.status;
    const errorBody = await response.text().catch(() => '');
    logger.error('PawaPay', `API error ${errorStatus}`, { body: errorBody.slice(0, 200) });
    throw new Error(`PawaPay API error (${errorStatus})`);
  }

  const wrapper = await response.json();
  if (wrapper.status === 'FOUND' && wrapper.data) {
    return wrapper.data as PawaPayDepositStatusResponse;
  }
  throw new Error(`PawaPay deposit not found: ${depositId}`);
}

export async function isPawaPayActive(): Promise<boolean> {
  const config = await db.paymentProviderConfig.findUnique({
    where: { provider: 'PAWAPAY' },
    select: { isActive: true, apiKey: true },
  });
  if (!config) return !!process.env.PAWAPAY_API_KEY;
  const dbKey = config.apiKey ? tryDecrypt(config.apiKey) : null;
  return config.isActive && !!dbKey;
}

export function generateDepositId(): string {
  return crypto.randomUUID();
}

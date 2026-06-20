import { vi } from 'vitest';
import 'fake-indexeddb/auto';

process.env.RESEND_API_KEY = 'test-key';
process.env.PAWAPAY_API_KEY = 'test-key';
process.env.PAWAPAY_ENVIRONMENT = 'sandbox';
process.env.APP_URL = 'http://localhost:3000';

vi.mock('@/lib/db', () => ({
  db: {},
}));

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
  requireAuth: vi.fn(),
  createToken: vi.fn(),
  setSessionCookie: vi.fn(),
  verifyPassword: vi.fn(),
  hashPassword: vi.fn(),
}));

vi.mock('@/lib/pawapay', () => ({
  initPaymentPage: vi.fn(),
  checkDepositStatus: vi.fn(),
  generateDepositId: vi.fn(() => 'test-deposit-id'),
  isPawaPayActive: vi.fn(),
}));

vi.mock('@/lib/email', () => ({
  sendTicketEmail: vi.fn(() => Promise.resolve()),
  sendEmail: vi.fn(() => Promise.resolve()),
  sendPurchaseConfirmation: vi.fn(() => Promise.resolve()),
  sendSubscriptionConfirmation: vi.fn(() => Promise.resolve()),
}));

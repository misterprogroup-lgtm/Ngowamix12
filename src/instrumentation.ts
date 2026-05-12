import { ensureSchema } from '@/lib/migrate';

export async function register() {
  await ensureSchema();
}

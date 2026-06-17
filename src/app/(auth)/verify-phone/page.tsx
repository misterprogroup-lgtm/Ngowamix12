import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

export default function VerifyPhonePage() {
  redirect(ROUTES.USER_DASHBOARD);
}

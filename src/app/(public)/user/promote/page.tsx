import { getCurrentUser } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';
import { redirect } from 'next/navigation';
import { PromoteForm } from '@/components/promote/promote-form';

export const dynamic = 'force-dynamic';

export default async function PromotePage() {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.LOGIN);

  return (
    <div className="container mx-auto py-8 pb-24 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Promouvoir votre musique</h1>
      <p className="text-text-secondary mb-6">
        Mettez en avant votre contenu auprès de la communauté Ngowamix
      </p>

      <PromoteForm />
    </div>
  );
}

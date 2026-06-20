import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';
import { Download, Music, HardDrive, ArrowLeft } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import { OfflineManager } from '@/components/offline/offline-manager';

export const dynamic = 'force-dynamic';

export default async function OfflinePage() {
  const user = await getCurrentUser();

  if (!user?.isPremium && user?.role !== 'ADMIN') {
    return (
      <div className="container mx-auto py-8 pb-24 max-w-2xl text-center">
        <Download className="h-12 w-12 mx-auto mb-3 opacity-50 text-text-muted" />
        <h1 className="text-xl font-bold mb-2">Mode hors-ligne</h1>
        <p className="text-text-muted mb-4">Le mode hors-ligne est réservé aux abonnés Premium</p>
        <Link href="/premium">
          <button className="px-4 py-2 bg-primary text-white rounded-lg">Passer au Premium</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 pb-24 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={ROUTES.USER_DASHBOARD} className="text-text-muted hover:text-text">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Mode hors-ligne</h1>
      </div>

      <OfflineManager />
    </div>
  );
}

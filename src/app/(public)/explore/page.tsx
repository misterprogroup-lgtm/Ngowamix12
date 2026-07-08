import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ExploreClient } from './explore-client';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Explorer le catalogue',
  description: 'Parcourez le catalogue musical africain : Afrobeats, Amapiano, Coupé-Décalé, et tous les genres. Découvrez de nouveaux artistes et albums.',
  alternates: { canonical: '/explore' },
  openGraph: {
    title: 'Explorer le catalogue - Ngowamix',
    description: 'Parcourez le catalogue musical africain sur Ngowamix.',
  },
  twitter: {
    title: 'Explorer le catalogue - Ngowamix',
    description: 'Parcourez le catalogue musical africain sur Ngowamix.',
  },
};

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ExploreClient />
    </Suspense>
  );
}

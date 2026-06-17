import type { Metadata } from 'next';
import { ExploreClient } from './explore-client';

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
  return <ExploreClient />;
}

'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const Recommendations = dynamic(
  () => import('@/components/home/personalized-recommendations').then((m) => ({ default: m.PersonalizedRecommendations })),
  { ssr: false }
);

export function RecommendationsWrapper() {
  return (
    <Suspense fallback={null}>
      <Recommendations />
    </Suspense>
  );
}

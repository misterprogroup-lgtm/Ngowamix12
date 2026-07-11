import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forfait familial',
  description: 'Profitez de Ngowamix Premium en famille. Jusqu\'à 6 membres avec un seul abonnement.',
  alternates: { canonical: '/premium/family' },
};

export default function FamilyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

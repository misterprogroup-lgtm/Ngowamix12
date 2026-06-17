import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: '/purchase/success' },
};

export default function PurchaseSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

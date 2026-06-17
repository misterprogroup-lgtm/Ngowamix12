import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: '/tickets/success' },
};

export default function TicketSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

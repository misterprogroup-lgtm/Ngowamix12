import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Livestream',
  description: 'Regardez les concerts et événements en direct de vos artistes africains préférés sur Ngowamix.',
  alternates: { canonical: '/livestream' },
};

export default function LivestreamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recherche',
  description: 'Recherchez vos artistes, albums et musiques africaines préférés sur Ngowamix.',
  alternates: { canonical: '/search' },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

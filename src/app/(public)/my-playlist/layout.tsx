import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mon historique',
  description: 'Retrouvez votre historique d\'écoute et vos morceaux favoris sur Ngowamix.',
  alternates: { canonical: '/my-playlist' },
};

export default function MyPlaylistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

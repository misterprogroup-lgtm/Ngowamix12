import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Playlist partagée',
  description: 'Découvrez une playlist partagée de musique africaine sur Ngowamix.',
};

export default function SharedPlaylistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

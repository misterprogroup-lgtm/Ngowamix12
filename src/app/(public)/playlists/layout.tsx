import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mes playlists',
  description: 'Gérez et organisez vos playlists de musique africaine sur Ngowamix.',
  alternates: { canonical: '/playlists' },
};

export default function PlaylistsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

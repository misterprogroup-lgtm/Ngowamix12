import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Playlist',
  description: 'Écoutez et gérez vos playlists de musique africaine sur Ngowamix.',
};

export default function PlaylistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

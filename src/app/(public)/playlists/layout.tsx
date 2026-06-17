import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: '/playlists' },
};

export default function PlaylistsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

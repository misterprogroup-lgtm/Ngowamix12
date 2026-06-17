import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: '/my-playlist' },
};

export default function MyPlaylistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

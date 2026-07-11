import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentification',
  description: 'Connectez-vous ou créez un compte sur Ngowamix pour profiter de la musique africaine en streaming.',
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

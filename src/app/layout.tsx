import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import '@/styles/globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AudioPlayer } from '@/components/player/audio-player';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { ToastProvider } from '@/components/feedback/toast';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { TermsAcceptanceModal } from '@/components/layout/terms-modal';
import { db } from '@/lib/db';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Ngowamix - Streaming musical africain',
    template: '%s | Ngowamix',
  },
  description: 'Écoutez et découvrez la musique africaine. Streaming gratuit, abonnement premium et achat d\'albums.',
  keywords: ['musique africaine', 'streaming', 'afrobeats', 'amapiano', 'coupé-décalé', 'musique afrique'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ngowamix',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: process.env.APP_URL || 'https://ngowamix.com',
    siteName: 'Ngowamix',
    title: 'Ngowamix - Streaming musical africain',
    description: 'La plateforme de streaming musical dédiée à la musique africaine francophone.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ngowamix - Streaming musical africain',
    description: 'Écoutez et découvrez la musique africaine.',
  },
  icons: {
    icon: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FF8C00',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} antialiased`}>
      <head>
        <meta name="application-name" content="Ngowamix" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Ngowamix" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/logo-icon.png" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-text-primary">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('ngowamix-theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
          <ThemeProvider>
            <ToastProvider>
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <AudioPlayer />
              <InstallPrompt />
              <TermsAcceptanceModal />
              <Script id="register-sw" strategy="afterInteractive">
            {`
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(reg => console.log('SW registered'))
                    .catch(err => console.log('SW registration failed'));
                });
              }
            `}
          </Script>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export async function generateRobotsTxt() {
  const appUrl = process.env.APP_URL || 'https://ngowamix.com';
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      {
        userAgent: '*',
        disallow: ['/api/', '/user/', '/admin/'],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}

export async function generateSitemap() {
  const appUrl = process.env.APP_URL || 'https://ngowamix.com';

  try {
    const [albums, artists] = await Promise.all([
      db.album.findMany({ where: { status: 'PUBLISHED' }, select: { id: true, updatedAt: true } }),
      db.artist.findMany({ select: { slug: true, updatedAt: true } }),
    ]);

    const staticPages = ['/', '/explore', '/premium', '/about', '/contact', '/help', '/terms', '/privacy'];

    const albumUrls = albums.map((a) => ({
      url: `${appUrl}/album/${a.id}`,
      lastModified: a.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }));

    const artistUrls = artists.map((a) => ({
      url: `${appUrl}/artist/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const staticUrls = staticPages.map((page) => ({
      url: `${appUrl}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticUrls, ...albumUrls, ...artistUrls];
  } catch {
    return [];
  }
}

import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';
import Script from 'next/script';
import '@/styles/globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AudioPlayer } from '@/components/player/audio-player';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { PushNotificationManager } from '@/components/pwa/push-manager';
import { ToastProvider } from '@/components/feedback/toast';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { TermsAcceptanceModal } from '@/components/layout/terms-modal';
import { AuthProvider } from '@/components/auth/auth-provider';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { MissingAvatarPopup } from '@/components/layout/missing-avatar-popup';
import { AdPopup } from '@/components/ads/ad-popup';
import { AdBanner } from '@/components/ads/ad-banner';
import { AdSidebar } from '@/components/ads/ad-sidebar';
import { PageTransition } from '@/components/layout/page-transition';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

const appUrl = process.env.APP_URL || 'https://ngowamix.com';

export const metadata: Metadata = {
  other: {
    'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '4kYRohrvFRGB2DvZs69T6AP-s8SULW9ZO0PApCTwnb4',
  },
  title: {
    default: 'Ngowamix - Streaming musical africain',
    template: '%s | Ngowamix',
  },
  description: 'Écoutez et découvrez la musique africaine. Streaming gratuit, abonnement premium et achat d\'albums.',
  keywords: ['musique africaine', 'streaming', 'afrobeats', 'amapiano', 'coupé-décalé', 'musique afrique'],
  manifest: '/manifest.json',
  metadataBase: new URL(appUrl),
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ngowamix',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://ngowamix.com',
    siteName: 'Ngowamix',
    title: 'Ngowamix - Streaming musical africain',
    description: 'La plateforme de streaming musical dédiée à la musique africaine francophone.',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: "Ngowamix — l'Afrique en musique" }],
    countryName: 'Côte d\'Ivoire',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ngowamix - Streaming musical africain',
    description: 'Écoutez et découvrez la musique africaine.',
    images: ['/og.jpg'],
  },
  icons: {
    icon: '/logo-icon.png',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
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
    <html lang="fr" className={`${nunito.variable} antialiased`}>
      <head>
        <meta name="application-name" content="Ngowamix" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Ngowamix" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://utfs.io" />
        <link rel="preconnect" href="https://uploadthing.com" />
        <link rel="dns-prefetch" href="https://utfs.io" />
        <link rel="dns-prefetch" href="https://uploadthing.com" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-text-primary">
              <ThemeProvider>
                <ToastProvider>
                  <AuthProvider>
                  <Header />
                  <main className="flex-1 pb-32 md:pb-0 pl-1 pr-4 sm:px-6 lg:px-8">
                    <PageTransition>
                      <div className="container mx-auto pt-4">
                        <AdBanner />
                      </div>
                      <Analytics />
                      <SpeedInsights />
                      {children}
                    </PageTransition>
                  </main>
              <Footer />
              <MobileBottomNav />
              <AudioPlayer />
              <InstallPrompt />
              <PushNotificationManager />
              <TermsAcceptanceModal />
              <MissingAvatarPopup />
              <AdPopup />
              </AuthProvider>
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Ngowamix',
              url: appUrl,
              logo: `${appUrl}/logo-icon.png`,
              sameAs: [
                'https://facebook.com/ngowamix',
                'https://instagram.com/ngowamix',
                'https://twitter.com/ngowamix',
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}

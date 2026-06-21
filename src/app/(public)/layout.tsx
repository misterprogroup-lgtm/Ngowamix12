import { SidebarSpotify } from '@/components/layout/sidebar-spotify';
import { TopBar } from '@/components/layout/top-bar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Footer } from '@/components/layout/footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarSpotify />
      <div className="md:ml-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-32 md:pb-24">
          <div className="mx-auto max-w-7xl pt-4">
            {children}
          </div>
        </main>
        <Footer />
      </div>
      <MobileNav />
    </>
  );
}

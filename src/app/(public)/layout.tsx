import { Sidebar } from '@/components/layout/sidebar';
import { AdBanner } from '@/components/ads/ad-banner';
import { AdPopup } from '@/components/ads/ad-popup';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="container mx-auto pt-4 px-4">
          <AdBanner />
        </div>
        {children}
      </div>
      <AdPopup />
    </div>
  );
}

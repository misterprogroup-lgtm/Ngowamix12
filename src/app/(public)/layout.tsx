import { Sidebar } from '@/components/layout/sidebar';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <div className="md:ml-72">{children}</div>
    </>
  );
}

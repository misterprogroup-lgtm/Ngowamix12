import { Sidebar } from '@/components/layout/sidebar';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <div className="md:ml-60">{children}</div>
    </>
  );
}

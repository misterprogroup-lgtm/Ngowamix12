import Link from 'next/link';
import { cn } from '@/lib/utils';

const categories = [
  { label: 'Tous', href: '/explore' },
  { label: 'Afro', href: '/explore?genre=Afro' },
  { label: 'Hip-Hop/Rap', href: '/explore?genre=Hip-Hop' },
  { label: 'Latino', href: '/explore?genre=Latino' },
  { label: 'Jazz/Blues', href: '/explore?genre=Jazz' },
  { label: 'Caraïbes', href: '/explore?genre=Cara%C3%AFbes' },
  { label: 'Pop', href: '/explore?genre=Pop' },
  { label: 'R&B', href: '/explore?genre=R%26B' },
  { label: 'Gospel', href: '/explore?genre=Gospel' },
  { label: 'Électro', href: '/explore?genre=%C3%89lectro' },
  { label: 'Rock', href: '/explore?genre=Rock' },
];

export function CategoryTabs() {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-scroll-container py-1">
      {categories.map((cat) => (
        <Link
          key={cat.label}
          href={cat.href}
          className={cn(
            'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border',
            'bg-transparent text-[#888] border-[#ffffff15] hover:border-[#ff990066] hover:text-[#ff9900] hover:bg-[#ff990011]'
          )}
        >
          {cat.label}
        </Link>
      ))}
    </div>
  );
}

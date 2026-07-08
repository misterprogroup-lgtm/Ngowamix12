import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  href?: string;
  linkLabel?: string;
}

export function SectionHeader({ title, href = '/explore', linkLabel = 'VOIR TOUT' }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
        {title}
      </h2>
      <Link
        href={href}
        className="flex items-center gap-1 text-sm font-medium text-[#888] hover:text-primary transition-colors duration-300"
      >
        {linkLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

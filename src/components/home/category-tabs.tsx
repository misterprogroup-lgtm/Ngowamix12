'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

const categories = [
  'Tous',
  'Afro',
  'Hip-Hop/Rap',
  'Latino',
  'Jazz/Blues',
  'Caraïbes',
  'Pop',
  'R&B',
  'Gospel',
  'Électro',
  'Rock',
];

export function CategoryTabs() {
  const [active, setActive] = useState('All');

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-scroll-container py-1">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActive(cat)}
          className={cn(
            'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border',
            active === cat
              ? 'bg-[#ff9900] text-white border-[#ff9900]'
              : 'bg-transparent text-[#888] border-[#ffffff15] hover:border-[#ff990066] hover:text-[#ff9900]'
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

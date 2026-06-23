'use client';

import { SafeImage } from '@/components/ui/safe-image';
import { BadgeCheck, User } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';

interface Account {
  id: string;
  avatar: string | null;
  name: string;
  followers?: string;
  slug?: string;
}

function VerifiedBadge() {
  return (
    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#ff9900] flex items-center justify-center ring-2 ring-[#0a0a0a]">
      <BadgeCheck className="h-3 w-3 text-white" />
    </div>
  );
}

export function AccountsForYou({ accounts }: { accounts: Account[] }) {
  if (!accounts.length) return null;

  return (
    <section>
      <SectionHeader title="COMPTES POUR VOUS" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="relative mb-3">
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-full bg-[#141414] border-2 border-[#ffffff15] overflow-hidden transition-all duration-300 group-hover:border-[#ff990066] group-hover:shadow-lg group-hover:shadow-[#ff9900]/10">
                <SafeImage
                  src={account.avatar || ''}
                  alt={account.name}
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                  fallback={
                    <div className="flex h-full items-center justify-center text-[#666]">
                      <User className="h-8 w-8" />
                    </div>
                  }
                />
              </div>
              <VerifiedBadge />
            </div>
            <p className="text-sm font-bold text-white truncate max-w-[120px]">
              {account.name}
            </p>
            {account.followers && (
              <p className="text-xs text-[#888] mt-0.5">
                {account.followers} Abonnés
              </p>
            )}
            <button className="mt-3 px-5 py-1.5 rounded-full border border-[#ff9900] bg-transparent text-white text-xs font-semibold transition-all duration-300 hover:bg-[#ff9900] hover:text-white">
              SUIVRE
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

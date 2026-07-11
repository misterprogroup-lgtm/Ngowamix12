'use client';

import Link from 'next/link';
import { SafeImage } from '@/components/ui/safe-image';
import { BadgeCheck, User } from 'lucide-react';
import { HorizontalScroll } from '@/components/ui/horizontal-scroll';
import { FollowButton } from '@/components/catalog/follow-button';

interface Account {
  id: string;
  avatar: string | null;
  name: string;
  followers?: string;
  slug?: string;
  isVerified?: boolean;
}

function VerifiedBadge() {
  return (
    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center ring-2 ring-background">
      <BadgeCheck className="h-3 w-3 text-white" />
    </div>
  );
}

export function AccountsForYou({ accounts }: { accounts: Account[] }) {
  if (!accounts.length) return null;

  return (
    <HorizontalScroll title="ARTISTES À LA UNE" withPadding={false}>
      {accounts.map((account) => (
        <div
          key={account.id}
          className="flex flex-col items-center text-center group w-2/5 sm:w-1/4 shrink-0 snap-start px-1.5">
          <Link
            href={`/artist/${account.slug || account.id}`}
            className="flex flex-col items-center text-center"
          >
            <div className="relative mb-2 sm:mb-3">
              <div className="h-20 w-20 sm:h-32 sm:w-32 rounded-full bg-surface border-2 border-border/20 overflow-hidden transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/10">
                <SafeImage
                  src={account.avatar || ''}
                  alt={account.name}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                  fallback={
                    <div className="flex h-full items-center justify-center text-text-muted">
                      <User className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                  }
                />
              </div>
              {account.isVerified && <VerifiedBadge />}
            </div>
            <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[100px] sm:max-w-[120px]">
              {account.name}
            </p>
            {account.followers && (
              <p className="text-[10px] sm:text-xs text-text-muted mt-0.5">
                {account.followers} Abonnés
              </p>
            )}
          </Link>
          <div className="mt-2 sm:mt-3">
            <FollowButton artistId={account.id} />
          </div>
        </div>
      ))}
    </HorizontalScroll>
  );
}

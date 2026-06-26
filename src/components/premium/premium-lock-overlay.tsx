'use client';

import { Crown } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

interface PremiumLockOverlayProps {
  isPremiumOnly: boolean;
  variant?: 'card' | 'cover' | 'badge';
  className?: string;
}

export function PremiumLockOverlay({
  isPremiumOnly,
  variant = 'card',
  className,
}: PremiumLockOverlayProps) {
  const { user } = useAuthStore();
  const isPremium = user?.isPremium ?? false;

  if (!isPremiumOnly || isPremium) return null;

  if (variant === 'badge') {
    return (
      <div className={cn('absolute top-2 left-2 z-10', className)}>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-primary text-[10px] font-bold leading-none shadow-lg">
          <Crown className="h-3 w-3" />
          Premium
        </div>
      </div>
    );
  }

  return (
    <div className={cn('absolute inset-0 z-10', className)}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm shadow-lg shadow-primary/20">
          <Crown className="h-5 w-5 text-primary" />
        </div>
        <span className="text-xs font-bold text-white/90 text-center leading-tight">
          Contenu Premium
        </span>
        <Link
          href="/premium"
          className="mt-1 px-3 py-1.5 rounded-full bg-primary text-white text-[10px] font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/30"
        >
          Débloquer
        </Link>
      </div>
    </div>
  );
}

import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayButtonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
};

const iconSizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function PlayButton({ size = 'md', className, onClick }: PlayButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center transition-all duration-300 hover:bg-primary-hover hover:shadow-primary/40 active:scale-95',
        sizeMap[size],
        className
      )}
    >
      <Play className={cn('ml-0.5', iconSizeMap[size])} fill="currentColor" />
    </button>
  );
}

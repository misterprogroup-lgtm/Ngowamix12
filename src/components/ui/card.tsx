import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({
  className,
  children,
  hover = false,
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/50 bg-surface p-5 transition-all duration-300',
        hover && 'hover:bg-surface-hover hover:border-border-light hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn('pt-4', className)}>{children}</div>;
}

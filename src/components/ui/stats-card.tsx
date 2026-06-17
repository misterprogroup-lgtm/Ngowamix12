import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function StatsCard({ icon: Icon, label, value, trend, className }: StatsCardProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-surface p-5', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              trend.positive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
            )}
          >
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-text-secondary mt-1">{label}</p>
    </div>
  );
}

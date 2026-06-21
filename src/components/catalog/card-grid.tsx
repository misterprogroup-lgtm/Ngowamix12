import { cn } from '@/lib/utils';

interface CardGridProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function CardGrid({ children, title, description, className }: CardGridProps) {
  return (
    <section className={cn('', className)}>
      {title && (
        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary">{title}</h2>
          {description && (
            <p className="text-sm text-text-secondary mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {children}
      </div>
    </section>
  );
}

interface CardGridSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function CardGridSection({ title, children, className }: CardGridSectionProps) {
  return (
    <section className={cn('mb-8', className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-text-primary">{title}</h2>
        <a
          href="#"
          className="text-sm font-semibold text-text-secondary hover:text-text-primary hover:underline transition-colors"
        >
          Tout voir
        </a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {children}
      </div>
    </section>
  );
}

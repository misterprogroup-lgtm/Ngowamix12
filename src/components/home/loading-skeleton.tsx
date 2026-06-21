import { Skeleton } from '@/components/ui/skeleton';

export function HomeSkeletons() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero skeleton */}
      <section className="h-screen flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <Skeleton className="h-6 w-40 rounded-full mx-auto" />
          <Skeleton className="h-16 w-[600px] max-w-full mx-auto" />
          <Skeleton className="h-6 w-[400px] max-w-full mx-auto" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-14 w-52 rounded-lg" />
            <Skeleton className="h-14 w-64 rounded-lg" />
          </div>
        </div>
      </section>

      {/* Recently played skeleton */}
      <section className="py-12">
        <div className="container mx-auto space-y-4">
          <Skeleton className="h-8 w-56" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </section>

      {/* Genres skeleton */}
      <section className="py-12">
        <div className="container mx-auto space-y-8">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      </section>

      {/* Artists skeleton */}
      <section className="py-12">
        <div className="container mx-auto space-y-8">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-full" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

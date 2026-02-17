export function HeroSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      {/* Featured Skeleton */}
      <div className="md:col-span-7">
        <div className="aspect-[4/3] min-h-[400px] animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800 md:min-h-[500px]" />
      </div>
      {/* Side Skeletons */}
      <div className="flex flex-col gap-4 md:col-span-5">
        <div className="aspect-[16/9] min-h-[180px] animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800 md:min-h-[240px]" />
        <div className="aspect-[16/9] min-h-[180px] animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800 md:min-h-[240px]" />
      </div>
    </div>
  )
}

export function CategorySectionSkeleton() {
  return (
    <section className="py-8 md:py-12">
      {/* Header Skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-4 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
      {/* Cards Skeleton - 3 cols */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="mb-3 aspect-[4/3] animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-3 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="mt-2 h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        ))}
      </div>
    </section>
  )
}

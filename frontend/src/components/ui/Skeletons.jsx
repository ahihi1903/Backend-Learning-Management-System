function SkeletonLine({ className = "" }) {
  return (
    <span
      className={`block h-3 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800 ${className}`}
    />
  );
}

export function CourseGridSkeleton({ count = 4 }) {
  return (
    <div
      className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Đang tải danh sách khóa học"
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          className="overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          aria-hidden="true"
          key={index}
        >
          <div className="aspect-[16/10] animate-pulse bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid gap-4 p-5">
            <SkeletonLine className="w-1/3" />
            <SkeletonLine className="h-5 w-4/5" />
            <SkeletonLine />
            <SkeletonLine className="w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

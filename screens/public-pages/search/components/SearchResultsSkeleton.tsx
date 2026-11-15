import { Skeleton } from "@/components/ui/skeleton";

export default function SearchResultsSkeleton() {
  return (
    <div
      aria-label="Loading search results"
      aria-busy="true"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="w-full max-w-134.5 overflow-hidden rounded-xl border border-border bg-card"
        >
          <Skeleton className="h-56 w-full rounded-none sm:h-64" />
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-28" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-3 pt-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

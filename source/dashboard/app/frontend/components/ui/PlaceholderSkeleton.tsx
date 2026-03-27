import { cn } from "@/lib/utils";

interface PlaceholderSkeletonProps {
  className?: string;
}

export function PlaceholderSkeleton({ className }: PlaceholderSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* KPI card row skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-lg border border-border p-6 animate-pulse">
            <div className="h-3 w-20 bg-border rounded mb-3" />
            <div className="h-6 w-16 bg-border rounded" />
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div className="bg-surface rounded-lg border border-border p-6 animate-pulse">
        <div className="h-3 w-32 bg-border rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 bg-border rounded" style={{ width: `${80 - i * 8}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

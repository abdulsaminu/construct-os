import React from 'react';

interface Props {
  className?: string;
}

export const Skeleton: React.FC<Props> = ({ className = '' }) => (
  <div className={`skeleton-shimmer rounded-lg ${className}`} />
);

export const CardSkeleton = () => (
  <div className="bg-surface rounded-card border border-border-main p-6 space-y-4">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-10 w-3/4" />
    <Skeleton className="h-3 w-32" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24 flex-1" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-surface rounded-card border border-border-main p-6">
    <div className="h-48 flex items-end gap-4">
      <Skeleton className="h-32 w-8" />
      <Skeleton className="h-24 w-8" />
      <Skeleton className="h-40 w-8" />
      <Skeleton className="h-16 w-8" />
      <Skeleton className="h-36 w-8" />
      <Skeleton className="h-20 w-8" />
      <Skeleton className="h-28 w-8" />
    </div>
  </div>
);
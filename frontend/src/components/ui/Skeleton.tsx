import React from 'react';

interface Props {
  className?: string;
}

export const Skeleton: React.FC<Props> = ({ className = '' }) => (
  <div className={`animate-pulse bg-elevated rounded-lg ${className}`} />
);

export const CardSkeleton = () => (
  <div className="bg-surface rounded-2xl border border-border-main p-6 space-y-4">
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

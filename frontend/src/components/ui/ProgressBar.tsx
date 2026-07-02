import React from 'react';

interface Props {
  percentage: number;
  color?: string;
}

export const ProgressBar: React.FC<Props> = React.memo(({ percentage, color = 'bg-primary' }) => (
  <div className="w-full bg-elevated rounded-full h-2">
    <div
      className={`${color} h-2 rounded-full progress-bar-fill`}
      style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
    />
  </div>
));

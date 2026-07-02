import React from 'react';

interface Props {
  percentage: number;
  color?: string;
}

export const ProgressBar: React.FC<Props> = ({ percentage, color = 'bg-primary' }) => (
  <div className="w-full bg-elevated rounded-full h-2">
    <div 
      className={`${color} h-2 rounded-full transition-all duration-200`} 
      style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }} 
    />
  </div>
);

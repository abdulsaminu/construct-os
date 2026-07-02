import React from 'react';

interface Props {
  value: number;
}

export const ConfidenceBadge: React.FC<Props> = ({ value }) => {
  let color: string;

  if (value >= 70) {
    color = 'bg-success/20 text-success';
  } else if (value >= 40) {
    color = 'bg-primary/20 text-primary';
  } else {
    color = 'bg-warning/20 text-warning';
  }

  return (
    <span className={`px-3 py-1 rounded-badge text-caption font-bold ${color}`}>
      {value}%
    </span>
  );
};
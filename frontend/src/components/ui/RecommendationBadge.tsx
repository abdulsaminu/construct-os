import React from 'react';

interface Props {
  type: 'fund' | 'watch' | 'hold' | 'skip';
}

export const RecommendationBadge: React.FC<Props> = ({ type }) => {
  const styles = {
    fund: 'bg-success/20 text-success border-success/30',
    watch: 'bg-primary/20 text-primary border-primary/30',
    hold: 'bg-warning/20 text-warning border-warning/30',
    skip: 'bg-white/10 text-text-dim border-border-main',
  };
  return <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${styles[type]}`}>{type.toUpperCase()}</span>;
};

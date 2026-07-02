import React from 'react';

interface Props {
  status: string;
}

export const StatusBadge: React.FC<Props> = React.memo(({ status }) => {
  const styles: Record<string, string> = {
    'draft': 'bg-white/10 text-text-dim',
    'active': 'bg-primary/20 text-primary',
    'completed': 'bg-success/20 text-success',
    'at_risk': 'bg-danger/20 text-danger',
  };

  return (
    <span className={`px-3 py-1 rounded-badge text-caption font-bold ${styles[status] || 'bg-white/10 text-text-dim'}`}>
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
});

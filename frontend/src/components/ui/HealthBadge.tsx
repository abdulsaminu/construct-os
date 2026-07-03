import React from 'react';

interface Props {
  status: 'Healthy' | 'Warning' | 'Offline' | 'Syncing';
}

export const HealthBadge: React.FC<Props> = ({ status }) => {
  const config = {
    Healthy: { dot: 'bg-success', text: 'text-success' },
    Warning: { dot: 'bg-warning', text: 'text-warning' },
    Offline: { dot: 'bg-danger', text: 'text-danger' },
    Syncing: { dot: 'bg-primary animate-pulse', text: 'text-primary' },
  };
  const c = config[status];
  return (
 <div className="flex items-center gap-2">
 <div className={`w-2 h-2 rounded-full ${c.dot}`} />
 <span className={`text-small font-medium ${c.text}`}>{status}</span>
    </div>
  );
};

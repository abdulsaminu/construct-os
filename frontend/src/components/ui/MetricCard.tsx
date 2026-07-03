import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string;
  footer: string;
  icon: LucideIcon;
  color: string;
  change?: string;
}

export const MetricCard = memo<Props>(({ title, value, footer, icon: Icon, color, change }) => (
  <div className="bg-surface rounded-card border border-border-main p-6 shadow-surface card-interactive flex flex-col justify-between h-full">
    <div className="flex items-start justify-between mb-4">
      <p className="text-label text-text-dim">{title}</p>
      <div className="p-3 rounded-btn bg-elevated border border-border-main">
        <Icon aria-hidden='true' size={24} strokeWidth={1.75} className={color} />
      </div>
    </div>
    <div>
      <p className="text-display-md font-bold text-text-main leading-none mb-2 tabular-nums">{value}</p>
      <div className="flex items-center gap-2">
        <p className="text-small text-text-muted">{footer}</p>
        {change && (
          <span className={`text-caption font-bold ${change.startsWith('-') ? 'text-danger' : 'text-success'}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  </div>
));
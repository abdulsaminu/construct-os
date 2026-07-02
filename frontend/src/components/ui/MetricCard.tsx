import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string;
  footer: string;
  icon: LucideIcon;
  color: string;
  change?: string;
}

export const MetricCard: React.FC<Props> = ({ title, value, footer, icon: Icon, color, change }) => (
  <div className="bg-surface rounded-2xl border border-border-main p-6 shadow-soft flex flex-col justify-between h-full hover:-translate-y-0.5 transition-transform duration-150">
    <div className="flex items-start justify-between mb-4">
      <p className="text-[13px] font-normal text-text-dim uppercase tracking-wide">{title}</p>
      <div className={`p-2.5 rounded-xl bg-elevated ${color}`}>
        <Icon size={20} />
      </div>
    </div>
    <div>
      <p className="text-[44px] font-bold text-text-main leading-none mb-2">{value}</p>
      <div className="flex items-center gap-2">
        <p className="text-[13px] font-normal text-text-muted">{footer}</p>
        {change && (
          <span className={`text-[13px] font-bold ${change.startsWith('-') ? 'text-danger' : 'text-success'}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  </div>
);
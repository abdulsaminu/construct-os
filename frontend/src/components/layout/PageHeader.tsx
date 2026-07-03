import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<Props> = ({ title, icon: Icon, action }) => (
  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
    <div className="flex items-center gap-3">
      {Icon && <Icon size={28} className="text-primary" strokeWidth={1.75} />}
      <h1 className="text-page-title text-text-main">{title}</h1>
    </div>
    {action && <div>{action}</div>}
  </div>
);
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const EmptyState: React.FC<Props> = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <Icon size={48} className="text-text-dim mb-4" />
    <h4 className="text-lg font-semibold text-text-main mb-2">{title}</h4>
    <p className="text-sm text-text-muted max-w-sm">{description}</p>
  </div>
);

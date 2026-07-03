import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const EmptyState: React.FC<Props> = ({ icon: Icon, title, description }) => (
 <div className="flex flex-col items-center justify-center py-12 text-center">
 <Icon size={32} className="text-text-dim mb-4" />
 <h4 className="text-body-lg font-semibold text-text-main mb-2">{title}</h4>
 <p className="text-small text-text-muted max-w-sm">{description}</p>
  </div>
);

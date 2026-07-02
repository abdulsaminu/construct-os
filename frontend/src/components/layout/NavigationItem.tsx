import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick: () => void;
}

export const NavigationItem: React.FC<Props> = ({ icon: Icon, label, active, collapsed, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 h-11 px-3 rounded-lg text-left text-sm transition-colors relative group
      ${active 
        ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary pl-[9px]' 
        : 'text-text-muted hover:bg-white/5 hover:text-text-main border-l-4 border-transparent pl-[9px]'
      }
      ${collapsed ? 'justify-center' : ''}
    `}
    title={collapsed ? label : undefined}
  >
    <Icon size={20} className="shrink-0" />
    {!collapsed && <span className="truncate">{label}</span>}
  </button>
);

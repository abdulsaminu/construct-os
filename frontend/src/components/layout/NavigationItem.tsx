import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick: () => void;
}

export const NavigationItem = memo<Props>(({ icon: Icon, label, active, collapsed, onClick }) => (
  <button
    onClick={onClick}
 className={`
      w-full flex items-center gap-3 h-11 px-3 rounded-btn text-left text-small
      transition-all duration-fast ease-out
      active:scale-[0.98]
      relative group
      ${active
        ? 'bg-primary/10 text-primary font-semibold'
        : 'text-text-muted hover:bg-white/5 hover:text-text-main'
      }
      ${collapsed ? 'justify-center' : ''}
    `}
    title={collapsed ? label : undefined}
    aria-label={label} aria-current={active ? 'page' : undefined}
  >
 <Icon size={24} strokeWidth={2} className="shrink-0" />
    {!collapsed && (
 <span className="truncate transition-opacity duration-normal ease-out">{label}</span>
    )}
    {active && (
 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
    )}
  </button>
));

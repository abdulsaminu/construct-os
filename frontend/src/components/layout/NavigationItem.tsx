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
      w-full flex items-center gap-3 h-12 px-3 rounded-btn text-left
      transition-all duration-fast ease-out
      active:scale-[0.98]
      relative group
      ${active
        ? 'bg-sidebar-active text-sidebar-text-active font-medium'
        : 'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text'
      }
      ${collapsed ? 'justify-center' : ''}
    `}
    style={{ fontSize: '16px' }}
    title={collapsed ? label : undefined}
    aria-label={label} aria-current={active ? 'page' : undefined}
  >
    <Icon size={22} strokeWidth={1.75} className="shrink-0" />
    {!collapsed && (
      <span className="truncate transition-opacity duration-normal ease-out">{label}</span>
    )}
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full" />
    )}
  </button>
));
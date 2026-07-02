import React from 'react';
import {
  LayoutDashboard, Landmark, FolderKanban, Users, BrainCircuit,
  ScrollText, Receipt, Settings, ChevronLeft, ChevronRight,
  LucideIcon
} from 'lucide-react';
import { NavigationItem } from './NavigationItem';

interface PageConfig {
  id: string;
  label: string;
  icon: LucideIcon;
}

const mainNav: PageConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'treasury', label: 'Treasury', icon: Landmark },
  { id: 'portfolio', label: 'Portfolio', icon: FolderKanban },
  { id: 'contractors', label: 'Contractors', icon: Users },
  { id: 'intelligence', label: 'Intelligence', icon: BrainCircuit },
];

const secondaryNav: PageConfig[] = [
  { id: 'ledger', label: 'Ledger', icon: ScrollText },
  { id: 'settlements', label: 'Settlements', icon: Receipt },
];

interface Props {
  activePage: string;
  onNavigate: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<Props> = ({ activePage, onNavigate, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) => {
  const handleNav = (id: string) => {
    onNavigate(id);
    if (mobileOpen) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onCloseMobile} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full bg-surface border-r border-border-main z-50 flex flex-col
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-[280px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="h-16 flex items-center px-4 border-b border-border-main">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
              C
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="text-base font-bold text-text-main leading-tight">ConstructOS</h1>
                <p className="text-caption text-text-dim leading-tight">Construction Finance OS</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="mb-4">
            {!collapsed && <p className="text-caption font-semibold text-text-dim uppercase tracking-wider px-3 mb-2">Main</p>}
            {mainNav.map(item => (
              <NavigationItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activePage === item.id}
                collapsed={collapsed}
                onClick={() => handleNav(item.id)}
              />
            ))}
          </div>

          <div className="border-t border-border-main pt-4">
            {!collapsed && <p className="text-caption font-semibold text-text-dim uppercase tracking-wider px-3 mb-2">System</p>}
            {secondaryNav.map(item => (
              <NavigationItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activePage === item.id}
                collapsed={collapsed}
                onClick={() => handleNav(item.id)}
              />
            ))}
          </div>
        </nav>

        {/* Bottom Settings & Collapse */}
        <div className="border-t border-border-main p-3 space-y-1">
          <NavigationItem icon={Settings} label="Settings" collapsed={collapsed} onClick={() => {}} />

          {/* Collapse Button - Desktop Only */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center h-10 rounded-lg text-text-dim hover:bg-white/5 hover:text-text-main transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>
    </>
  );
};
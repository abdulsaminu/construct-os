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
      {/* Mobile Overlay — backdrop blur + fade */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden dialog-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-surface border-r border-border-main z-50 flex flex-col
          /* Smooth width transition — panel curve for large elements */
          transition-[width] duration-slow transition-timing-panel
          /* Label fade uses shorter duration */
          ${collapsed ? 'w-20' : 'w-[280px]'}
          /* Mobile: off-canvas by default, on-canvas when open. Desktop: always visible */
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-slow transition-timing-panel
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-4 border-b border-border-main shrink-0">
          <div className={`flex items-center gap-3 transition-all duration-normal ease-out ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-8 h-8 bg-primary rounded-btn flex items-center justify-center text-white font-bold text-small shrink-0">
              C
            </div>
            {!collapsed && (
              <div className="overflow-hidden transition-opacity duration-normal ease-out">
                <h1 className="text-small font-bold text-text-main leading-tight">ConstructOS</h1>
                <p className="text-caption text-text-dim leading-tight">Construction Finance OS</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1" aria-label="Primary">
          <div className="mb-4">
            {!collapsed && (
              <p className="text-caption font-semibold text-text-dim uppercase tracking-wider px-3 mb-2 transition-opacity duration-normal ease-out">
                Main
              </p>
            )}
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
            {!collapsed && (
              <p className="text-caption font-semibold text-text-dim uppercase tracking-wider px-3 mb-2 transition-opacity duration-normal ease-out">
                System
              </p>
            )}
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
        <div className="border-t border-border-main p-3 space-y-1 shrink-0">
          <NavigationItem icon={Settings} label="Settings" collapsed={collapsed} onClick={() => {}} />

          {/* Collapse Button — Desktop Only */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center h-10 rounded-btn text-text-dim
                       hover:bg-white/5 hover:text-text-main active:scale-[0.98]
                       transition-all duration-fast ease-out"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRight
              size={24}
              strokeWidth={2}
              className={`shrink-0 transition-transform duration-normal ease-out ${collapsed ? '' : 'rotate-180'}`}
            />
          </button>
        </div>
      </aside>
    </>
  );
};
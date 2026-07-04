import React from 'react';
import {
  LayoutDashboard, Landmark, FolderKanban, Users, BrainCircuit,
  ScrollText, Receipt, Settings, ChevronRight,
  LucideIcon
} from 'lucide-react';
import { NavigationItem } from './NavigationItem';
import { ConstructMark } from '../brand/ConstructMark';

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
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/40 backdrop-blur-sm"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-sidebar-bg z-50 flex flex-col
          transition-[width,transform] duration-slow transition-timing-panel
          ${collapsed ? 'w-20' : 'w-[280px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Brand Block */}
        <div className="h-[72px] flex items-center px-6 border-b border-sidebar-border shrink-0">
          <div className={`flex items-center gap-3 transition-all duration-normal ease-out ${collapsed ? 'justify-center w-full' : ''}`}>
            <ConstructMark size={28} />
            {!collapsed && (
              <div className="overflow-hidden transition-opacity duration-normal ease-out">
                <h1 className="text-h2 font-semibold text-sidebar-text-active leading-tight">ConstructOS</h1>
                <p className="text-caption text-sidebar-text-dim leading-tight tracking-wide">Construction Finance OS</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1" aria-label="Primary">
          <div className="mb-2">
            {!collapsed && (
              <p className="text-micro font-medium text-sidebar-text-dim uppercase tracking-[0.08em] px-3 mb-2 transition-opacity duration-normal ease-out">
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

          <div className="border-t border-sidebar-border pt-5">
            {!collapsed && (
              <p className="text-micro font-medium text-sidebar-text-dim uppercase tracking-[0.08em] px-3 mb-2 transition-opacity duration-normal ease-out">
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
        <div className="border-t border-sidebar-border p-4 space-y-1 shrink-0">
          <NavigationItem icon={Settings} label="Settings" collapsed={collapsed} onClick={() => {}} />

          {/* Collapse Button — Desktop Only */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center h-10 rounded-btn text-sidebar-text-dim
                       hover:bg-sidebar-hover hover:text-sidebar-text
                      
                       transition-all duration-fast ease-out"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRight
              size={20}
              strokeWidth={2}
              className={`shrink-0 transition-transform duration-normal ease-out ${collapsed ? '' : 'rotate-180'}`}
            />
          </button>
        </div>
      </aside>
    </>
  );
};
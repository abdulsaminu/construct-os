import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ToastProvider } from '../ui/Toast';

export const PAGE_META: Record<string, { title: string; description: string }> = {
  'dashboard': { title: 'Dashboard', description: 'System overview and key metrics' },
  'treasury': { title: 'Treasury', description: 'Capital pool management and deposits' },
  'portfolio': { title: 'Portfolio', description: 'Active construction projects and milestones' },
  'contractors': { title: 'Contractors', description: 'Manage registered contractors and payees' },
  'intelligence': { title: 'Intelligence', description: 'AI-driven allocations and forecasts' },
  'system': { title: 'System Health', description: 'Engine service status and diagnostics' },
  'ledger': { title: 'Ledger', description: 'Immutable append-only financial log' },
  'settlements': { title: 'Settlements', description: 'Arc blockchain settlement history' },
  'project-detail': { title: 'Project Details', description: 'Milestone execution and on-chain settlement' },
};

interface Props {
  activePage: string;
  onNavigate: (id: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<Props> = ({ activePage, onNavigate, children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const meta = PAGE_META[activePage] || PAGE_META['dashboard'];

  return (
    <ToastProvider>
      <div className="min-h-screen bg-bg flex">
        <Sidebar
          activePage={activePage}
          onNavigate={onNavigate}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <div className={`flex-1 flex flex-col transition-[margin] duration-slow transition-timing-panel ${collapsed ? 'lg:ml-20' : 'lg:ml-[280px]'}`}>
          <TopBar
            title={meta.title}
            description={meta.description}
            onMenuClick={() => setMobileOpen(true)}
          />
          <main id="main-content" className="flex-1 p-8 overflow-y-auto text-body">
            <div key={activePage} className="page-enter">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};
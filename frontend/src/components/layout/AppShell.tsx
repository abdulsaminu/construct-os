import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

// Define Page Meta Data centrally to feed TopBar
export const PAGE_META: Record<string, { title: string; description: string }> = {
  'dashboard': { title: 'Dashboard', description: 'System overview and key metrics' },
  'treasury': { title: 'Treasury', description: 'Capital pool management and deposits' },
  'portfolio': { title: 'Portfolio', description: 'Active construction projects and milestones' },
  'contractors': { title: 'Contractors', description: 'Manage registered contractors and payees' },
  'intelligence': { title: 'Intelligence', description: 'AI-driven allocations and forecasts' },
  'ledger': { title: 'Ledger', description: 'Immutable append-only financial log' },
  'forecasts': { title: 'Forecasts', description: 'Cash flow and completion projections' },
  'risk-engine': { title: 'Risk Engine', description: 'Composite risk scoring matrix' },
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
    <div className="min-h-screen bg-bg flex">
      <Sidebar 
        activePage={activePage} 
        onNavigate={onNavigate} 
        collapsed={collapsed} 
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-[280px]'}`}>
        <TopBar 
          title={meta.title} 
          description={meta.description} 
          onMenuClick={() => setMobileOpen(true)} 
        />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

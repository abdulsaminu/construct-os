import React, { useState, lazy, Suspense } from 'react';
import { AppShell } from './components/layout/AppShell';

// Lazy-load heavy pages
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const TreasuryPage = lazy(() => import('./pages/TreasuryPage').then(m => ({ default: m.TreasuryPage })));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage').then(m => ({ default: m.PortfolioPage })));
const NewProjectPage = lazy(() => import('./pages/NewProjectPage').then(m => ({ default: m.NewProjectPage })));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const ContractorsPage = lazy(() => import('./pages/ContractorsPage').then(m => ({ default: m.ContractorsPage })));
const IntelligencePage = lazy(() => import('./pages/IntelligencePage').then(m => ({ default: m.IntelligencePage })));
const LedgerPage = lazy(() => import('./pages/LedgerPage').then(m => ({ default: m.LedgerPage })));
const SettlementsPage = lazy(() => import('./pages/SettlementsPage').then(m => ({ default: m.SettlementsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Page-level skeleton
const PageSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="bg-elevated rounded-card h-16 w-64" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-surface rounded-card border border-border-main h-36 skeleton-shimmer" />
      ))}
    </div>
    <div className="bg-surface rounded-card border border-border-main h-64 skeleton-shimmer" />
  </div>
);

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [intelligenceTab, setIntelligenceTab] = useState<string | undefined>(undefined);

  const handleSelectProject = (id: string) => {
    setSelectedProject(id);
    window.history.pushState({}, '', `/portfolio/${id}`);
  };

  const handleProjectCreated = (id: string) => {
    setSelectedProject(id);
  };

  const navigateToIntelligenceTab = (tab: string) => {
    setIntelligenceTab(tab);
    setPage('intelligence');
  };

  const handleNavigate = (id: string) => {
    if (id === 'forecasts') {
      navigateToIntelligenceTab('forecasts');
      return;
    }
    if (id === 'risk-engine') {
      navigateToIntelligenceTab('risk');
      return;
    }
    if (id === 'system') {
      navigateToIntelligenceTab('health');
      return;
    }
    setIntelligenceTab(undefined);
    setPage(id);
  };

  const renderPage = () => {
    if (selectedProject) {
      return (
        <Suspense fallback={<PageSkeleton />}>
          <ProjectDetailPage id={selectedProject} onBack={() => setSelectedProject(null)} />
        </Suspense>
      );
    }

    const pages: Record<string, React.ReactNode> = {
      'dashboard': <DashboardPage onSelectProject={handleSelectProject} />,
      'treasury': <TreasuryPage onNavigate={setPage} />,
      'portfolio': <PortfolioPage onSelectProject={handleSelectProject} onNavigate={setPage} />,
      'new-project': <NewProjectPage onBack={() => setPage('portfolio')} onCreated={handleProjectCreated} />,
      'contractors': <ContractorsPage />,
      'intelligence': <IntelligencePage defaultTab={intelligenceTab} />,
      'ledger': <LedgerPage />,
      'settlements': <SettlementsPage />,
      'settings': <SettingsPage />,
    };

    return (
      <Suspense fallback={<PageSkeleton />}>
        {pages[page] || <DashboardPage onSelectProject={handleSelectProject} />}
      </Suspense>
    );
  };

  const activePageId = selectedProject ? 'portfolio' : page;

  return (
    <AppShell activePage={activePageId} onNavigate={handleNavigate}>
      {renderPage()}
    </AppShell>
  );
}
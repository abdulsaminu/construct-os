import React, { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { TreasuryPage } from './pages/TreasuryPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { NewProjectPage } from './pages/NewProjectPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ContractorsPage } from './pages/ContractorsPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { LedgerPage } from './pages/LedgerPage';
import { SettlementsPage } from './pages/SettlementsPage';
import { SettingsPage } from './pages/SettingsPage';

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
    // Redirect standalone intelligence routes to the hub
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
    // Detail view takes precedence
    if (selectedProject) {
      return <ProjectDetailPage id={selectedProject} onBack={() => setSelectedProject(null)} />;
    }

    switch (page) {
      case 'dashboard': return <DashboardPage onSelectProject={handleSelectProject} />;
      case 'treasury': return <TreasuryPage onNavigate={setPage} />;
      case 'portfolio': return <PortfolioPage onSelectProject={handleSelectProject} onNavigate={setPage} />;
      case 'new-project': return <NewProjectPage onBack={() => setPage('portfolio')} onCreated={handleProjectCreated} />;
      case 'contractors': return <ContractorsPage />;
      case 'intelligence': return <IntelligencePage defaultTab={intelligenceTab} />;
      case 'ledger': return <LedgerPage />;
      case 'settlements': return <SettlementsPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage onSelectProject={handleSelectProject} />;
    }
  };

  // Derive active page ID for sidebar highlighting
  const activePageId = selectedProject ? 'portfolio' : page;

  return (
    <AppShell activePage={activePageId} onNavigate={handleNavigate}>
      {renderPage()}
    </AppShell>
  );
}
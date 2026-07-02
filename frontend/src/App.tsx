import { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { TreasuryPage } from './pages/TreasuryPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { NewProjectPage } from './pages/NewProjectPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ContractorsPage } from './pages/ContractorsPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { LedgerPage } from './pages/LedgerPage';
import { ForecastsPage } from './pages/ForecastsPage';
import { RiskEnginePage } from './pages/RiskEnginePage';
import { SettlementsPage } from './pages/SettlementsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const handleSelectProject = (id: string) => {
    setSelectedProject(id);
    // Update internal page state to trigger TopBar meta update
    window.history.pushState({}, '', `/portfolio/${id}`);
  };

  const handleProjectCreated = (id: string) => {
    setSelectedProject(id);
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
      case 'intelligence': return <IntelligencePage />;
      case 'ledger': return <LedgerPage />;
      case 'forecasts': return <ForecastsPage />;
      case 'risk-engine': return <RiskEnginePage />;
      case 'settlements': return <SettlementsPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage onSelectProject={handleSelectProject} />;
    }
  };

  // Derive active page ID for sidebar highlighting
  const activePageId = selectedProject ? 'portfolio' : page;

  return (
    <AppShell activePage={activePageId} onNavigate={setPage}>
      {renderPage()}
    </AppShell>
  );
}

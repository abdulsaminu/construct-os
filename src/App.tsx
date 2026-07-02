import { useState } from 'react';
import TreasuryPage from './pages/TreasuryPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ContractorsPage from './pages/ContractorsPage';
import SystemPage from './pages/SystemPage';

const NAV = [
  { id: 'treasury', label: 'Treasury' },
  { id: 'projects', label: 'Projects' },
  { id: 'contractors', label: 'Contractors' },
  { id: 'system', label: 'System Analytics' }
];

export default function App() {
  const [page, setPage] = useState('treasury');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const renderPage = () => {
    if (selectedProject) return <ProjectDetailPage id={selectedProject} onBack={() => setSelectedProject(null)} />;
    switch (page) {
      case 'treasury': return <TreasuryPage />;
      case 'projects': return <ProjectsPage onSelect={setSelectedProject} />;
      case 'contractors': return <ContractorsPage />;
      case 'system': return <SystemPage />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-800 p-4 shadow-md flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-400">🏗️ ConstructOS</h1>
        <nav className="flex gap-4">
          {NAV.map(n => (
            <button key={n.id} onClick={() => { setPage(n.id); setSelectedProject(null); }} className={`px-3 py-1 rounded text-sm font-medium transition ${page === n.id && !selectedProject ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
              {n.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="flex-1 p-6 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
}

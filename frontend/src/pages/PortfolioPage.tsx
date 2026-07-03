import React, { useEffect, useState, useMemo } from 'react';
import { fetcher } from '../lib/api';
import { Project, RiskScore } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { PortfolioFilters } from '../components/portfolio/PortfolioFilters';
import { ProjectCard } from '../components/portfolio/ProjectCard';
import { EmptyState } from '../components/ui/EmptyState';
import { FolderKanban, Plus } from 'lucide-react';

interface Props {
  onSelectProject: (id: string) => void;
  onNavigate: (id: string) => void;
}

export const PortfolioPage: React.FC<Props> = ({ onSelectProject, onNavigate }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [risks, setRisks] = useState<Record<string, RiskScore>>({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [p, r] = await Promise.all([
        fetcher<Project[]>('/projects'),
        fetcher<Record<string, RiskScore>>('/system/risk')
      ]);
      setProjects(p);
      setRisks(r);
      setIsLoading(false);
    };
    load();
  }, []);

  const filteredProjects = useMemo(() => projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  }), [projects, search, statusFilter]);

  return (
    <div>
      <PageHeader 
        title="Portfolio"
        icon={FolderKanban} 
        action={
 <button onClick={() => onNavigate('new-project')} className="btn-primary">
            <Plus size={16} /> New Project
          </button>
        }
      />

      <PortfolioFilters search={search} onSearchChange={setSearch} statusFilter={statusFilter} onStatusChange={setStatusFilter} />

      {isLoading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
 {[1,2,3].map(i => <div key={i} className="bg-surface rounded-card border border-border-main h-48 animate-pulse" />)}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No Projects Yet" description="Create your first construction project." />
      ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map(p => (
            <ProjectCard key={p.id} project={p} risk={risks[p.id]} onSelect={onSelectProject} />
          ))}
        </div>
      )}
    </div>
  );
};

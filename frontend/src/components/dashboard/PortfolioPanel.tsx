import React from 'react';
import { Project, RiskScore } from '../../types';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { StatusBadge } from '../ui/StatusBadge';
import { ProgressBar } from '../ui/ProgressBar';
import { EmptyState } from '../ui/EmptyState';
import { money } from '../../lib/api';
import { FolderKanban, ArrowRight } from 'lucide-react';

interface Props {
  projects: Project[];
  risks: Record<string, RiskScore>;
  onSelectProject: (id: string) => void;
}

export const PortfolioPanel: React.FC<Props> = ({ projects, risks, onSelectProject }) => {
  const activeProjects = projects.filter(p => p.status === 'active');

  const getRiskColor = (pId: string) => {
    const risk = risks[pId];
    if (!risk) return 'bg-white/10 text-text-dim';
    if (risk.composite > 80) return 'bg-danger/20 text-danger';
    if (risk.composite > 60) return 'bg-warning/20 text-warning';
    if (risk.composite > 30) return 'bg-primary/20 text-primary';
    return 'bg-success/20 text-success';
  };

  const getProgressColor = (pId: string) => {
    const risk = risks[pId];
    if (!risk) return 'bg-primary';
    if (risk.composite > 80) return 'bg-danger';
    if (risk.composite > 60) return 'bg-warning';
    return 'bg-primary';
  };

  return (
    <Panel className="lg:col-span-8 col-span-12">
      <SectionHeader title="Active Portfolio" />
      {activeProjects.length === 0 ? (
        <EmptyState 
          icon={FolderKanban} 
          title="No Active Projects" 
          description="Create your first project to begin capital allocation." 
        />
      ) : (
        <div className="space-y-4">
          {activeProjects.map(p => {
            const fundedCount = p.milestones.filter(m => m.funded).length;
            const totalCount = p.milestones.length || 1;
            const progressPercent = Math.round((fundedCount / totalCount) * 100);
            
            return (
              <div 
                key={p.id} 
                className="p-6 bg-elevated rounded-12 border border-border-main  transition-transform duration-fast cursor-pointer group"
                onClick={() => onSelectProject(p.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-small font-medium text-text-main group-hover:text-primary transition-colors">{p.name}</h4>
                    <p className="text-caption text-text-dim mt-1">Budget: {money(p.totalBudget)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-badge text-caption font-bold ${getRiskColor(p.id)}`}>
                      {risks[p.id]?.composite ? `Risk ${risks[p.id].composite}` : 'Healthy'}
                    </span>
                    <ArrowRight size={16} className="text-text-dim group-hover:text-primary transition-colors mt-1" />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-caption mb-1.5">
                      <span className="text-text-dim">Milestones ({fundedCount}/{totalCount})</span>
                      <span className="text-text-muted font-medium">{progressPercent}%</span>
                    </div>
                    <ProgressBar percentage={progressPercent} color={getProgressColor(p.id)} />
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
};

import React from 'react';
import { Project, RiskScore } from '../../types';
import { money } from '../../lib/api';
import { DollarSign, ListChecks, Activity, ShieldAlert } from 'lucide-react';

interface Props {
  project: Project;
  risk?: RiskScore;
}

export const ProjectOverviewCards: React.FC<Props> = ({ project, risk }) => {
  const fundedCount = project.milestones.filter(m => m.funded).length;
  
  const getRiskColor = (score: number) => {
    if (score > 80) return 'text-danger';
    if (score > 60) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <OverviewCard title="Total Budget" value={money(project.totalBudget)} icon={DollarSign} color="text-primary" />
      <OverviewCard title="Status" value={project.status.replace('_', ' ').toUpperCase()} icon={ListChecks} color="text-text-main" />
      <OverviewCard title="Milestones" value={`${fundedCount} / ${project.milestones.length}`} icon={Activity} color="text-primary" />
      <OverviewCard 
        title="Risk Score" 
        value={risk ? `${risk.composite}/100` : 'N/A'} 
        icon={ShieldAlert} 
        color={risk ? getRiskColor(risk.composite) : 'text-text-dim'} 
      />
    </div>
  );
};

const OverviewCard = ({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ElementType; color: string }) => (
  <div className="bg-elevated rounded-xl p-4 flex items-center gap-4">
    <div className={`p-2.5 rounded-lg bg-surface ${color}`}><Icon size={20} /></div>
    <div>
      <p className="text-xs text-text-dim uppercase tracking-wide">{title}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  </div>
);

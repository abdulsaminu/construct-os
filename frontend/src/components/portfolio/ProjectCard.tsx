import React from 'react';
import { Project, RiskScore } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { ProgressBar } from '../ui/ProgressBar';
import { money } from '../../lib/api';
import { ArrowRight, Calendar, ListChecks } from 'lucide-react';

interface Props {
  project: Project;
  risk?: RiskScore;
  onSelect: (id: string) => void;
}

export const ProjectCard = React.memo<Props>(({ project, risk, onSelect }) => {
  // UI geometry only. Pending backend completionPercent field.
  const fundedCount = project.milestones.filter(m => m.funded).length;
  const totalCount = project.milestones.length || 1;
  const progressPercent = Math.round((fundedCount / totalCount) * 100);
  
  const getRiskStyles = () => {
    if (!risk) return 'bg-white/10 text-text-dim';
    if (risk.composite > 80) return 'bg-danger/20 text-danger';
    if (risk.composite > 60) return 'bg-warning/20 text-warning';
    return 'bg-success/20 text-success';
  };

  const getRiskLabel = () => {
    if (!risk) return 'N/A';
    if (risk.composite > 80) return 'HIGH';
    if (risk.composite > 60) return 'MEDIUM';
    return 'LOW';
  };

  const daysAgo = Math.floor((Date.now() - project.createdAt) / (1000 * 60 * 60 * 24));

  return (
    <div 
      onClick={() => onSelect(project.id)}
 className="bg-surface rounded-card border border-border-main p-6 shadow-surface transition-all duration-fast cursor-pointer group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(project.id)}
      aria-label={`Open project ${project.name}`}
    >
 <div className="flex items-start justify-between mb-4">
        <div>
 <h3 className="text-body-lg font-semibold text-text-main group-hover:text-primary transition-colors">{project.name}</h3>
          <StatusBadge status={project.status} />
        </div>
 <span className={`px-3 py-1 rounded-badge text-caption font-bold ${getRiskStyles()}`}>Risk: {getRiskLabel()}</span>
      </div>

 <div className="grid grid-cols-3 gap-4 mb-6 text-small">
        <div>
 <p className="text-text-dim text-caption mb-1">Budget</p>
 <p className="font-semibold text-text-main">{money(project.totalBudget)}</p>
        </div>
        <div>
 <p className="text-text-dim text-caption mb-1 flex items-center gap-1"><ListChecks size={16} /> Milestones</p>
 <p className="font-semibold text-text-main">{project.milestones.length}</p>
        </div>
        <div>
 <p className="text-text-dim text-caption mb-1 flex items-center gap-1"><Calendar size={16} /> Created</p>
 <p className="font-semibold text-text-main">{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</p>
        </div>
      </div>

 <div className="mb-4">
 <div className="flex justify-between text-caption text-text-dim mb-2">
          <span>Progress</span>
 <span className="font-medium text-text-muted">{progressPercent}%</span>
        </div>
        <ProgressBar percentage={progressPercent} />
      </div>

 <div className="flex items-center justify-end text-primary text-small font-medium opacity-0 group-hover:opacity-100 transition-opacity">
 Open Project <ArrowRight size={16} className="ml-1" />
      </div>
    </div>
  );
});

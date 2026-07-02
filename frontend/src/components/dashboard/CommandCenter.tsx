import React from 'react';
import { Project } from '../../types';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { EmptyState } from '../ui/EmptyState';
import { Terminal, ArrowRight } from 'lucide-react';

interface Props {
  projects: Project[];
  onSelectProject: (id: string) => void;
}

interface ActionItem {
  id: string;
  projectId: string;
  project: string;
  milestone: string;
  action: 'Fund' | 'Claim' | 'Settle' | 'Open';
}

export const CommandCenter: React.FC<Props> = ({ projects, onSelectProject }) => {
  const actions: ActionItem[] = [];

  projects.forEach(p => {
    if (p.status === 'completed') {
      actions.push({ id: `comp-${p.id}`, projectId: p.id, project: p.name, milestone: 'All Milestones', action: 'Open' });
      return;
    }
    
    p.milestones.forEach(m => {
      if (!m.funded) actions.push({ id: `fund-${m.id}`, projectId: p.id, project: p.name, milestone: m.name, action: 'Fund' });
      else if (!m.claimed) actions.push({ id: `claim-${m.id}`, projectId: p.id, project: p.name, milestone: m.name, action: 'Claim' });
      else if (!m.settled) actions.push({ id: `settle-${m.id}`, projectId: p.id, project: p.name, milestone: m.name, action: 'Settle' });
    });
  });

  const getActionStyles = (action: string) => {
    switch(action) {
      case 'Fund': return 'bg-primary/10 text-primary hover:bg-primary/20';
      case 'Claim': return 'bg-warning/10 text-warning hover:bg-warning/20';
      case 'Settle': return 'bg-success/10 text-success hover:bg-success/20';
      default: return 'bg-white/5 text-text-muted hover:bg-white/10';
    }
  };

  return (
    <Panel className="col-span-8">
      <SectionHeader title="Command Center" />
      {actions.length === 0 ? (
        <EmptyState icon={Terminal} title="All Clear" description="No actions required. System is idle." />
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {actions.slice(0, 10).map(item => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-elevated rounded-xl border border-border-main">
              <div className="min-w-0 flex-1 mr-4">
                <p className="text-[15px] font-medium text-text-main truncate">{item.project}</p>
                <p className="text-[13px] text-text-dim truncate">{item.milestone}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onSelectProject(item.projectId); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors duration-150 ${getActionStyles(item.action)}`}
              >
                {item.action} <ArrowRight size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
};

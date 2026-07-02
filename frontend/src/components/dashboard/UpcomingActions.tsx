import React from 'react';
import { Project } from '../../types';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { EmptyState } from '../ui/EmptyState';
import { ListChecks } from 'lucide-react';

interface Props {
  projects: Project[];
  onSelectProject: (id: string) => void;
}

export const UpcomingActions: React.FC<Props> = ({ projects, onSelectProject }) => {
  const actions: { id: string; text: string; projectId: string }[] = [];

  projects.forEach(p => {
    if (p.status === 'completed') return;
    p.milestones.forEach(m => {
      if (!m.funded) actions.push({ id: `fund-${m.id}`, text: `Fund ${m.name}`, projectId: p.id });
      else if (!m.claimed) actions.push({ id: `claim-${m.id}`, text: `Claim ${m.name}`, projectId: p.id });
      else if (!m.settled) actions.push({ id: `settle-${m.id}`, text: `Settle ${m.name}`, projectId: p.id });
    });
  });

  return (
    <Panel className="lg:col-span-4 col-span-12">
      <SectionHeader title="Upcoming Actions" />
      {actions.length === 0 ? (
        <EmptyState icon={ListChecks} title="No Actions" description="All tasks are complete." />
      ) : (
        <ul className="space-y-2">
          {actions.slice(0, 5).map(a => (
            <li key={a.id}>
              <button 
                onClick={() => onSelectProject(a.projectId)}
                className="w-full text-left p-3 rounded-8 bg-elevated text-small text-text-main hover:bg-white/5 transition-colors duration-fast"
              >
                {a.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
};

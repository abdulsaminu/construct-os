import React from 'react';
import { Project } from '../../types';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { EmptyState } from '../ui/EmptyState';
import { money } from '../../lib/api';
import { Activity } from 'lucide-react';

interface Props {
  projects: Project[];
}

export const SystemActivityLog: React.FC<Props> = ({ projects }) => {
  const activities: { id: string; text: string; time: string; color: string }[] = [];

  // Pure state scanning. NO financial math.
  projects.forEach(p => {
    p.milestones.forEach(m => {
      if (m.claimed && !m.settled) {
        activities.push({
          id: `settle-${m.id}`,
          text: `Awaiting Settlement: ${m.name} (${p.name})`,
          time: m.claimedAt ? new Date(m.claimedAt).toLocaleString() : '',
          color: 'text-warning'
        });
      } else if (m.funded && !m.claimed) {
        activities.push({
          id: `claim-${m.id}`,
          text: `Awaiting Claim: ${m.name} (${p.name})`,
          time: '',
          color: 'text-primary'
        });
      }
    });
  });

  const latestActivities = activities.slice(0, 8);

  return (
    <Panel className="lg:col-span-4 col-span-12">
      <SectionHeader title="System Activity Log" />
      {latestActivities.length === 0 ? (
        <EmptyState icon={Activity} title="All Clear" description="No pending actions." />
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {latestActivities.map(a => (
            <div key={a.id} className="p-3 bg-elevated rounded-8 border-l-2 border-border-main hover:border-primary transition-colors">
              <p className={`text-small font-medium ${a.color}`}>{a.text}</p>
              {a.time && <p className="text-caption text-text-dim mt-1">{a.time}</p>}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
};

import React from 'react';
import { LedgerEntry } from '../../types';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';
import { Activity } from 'lucide-react';

interface Props {
  entries: (LedgerEntry & { projectName?: string })[];
  isLoading: boolean;
}

export const ActivityFeed: React.FC<Props> = ({ entries, isLoading }) => {
  if (isLoading) return <Panel className="lg:col-span-4 col-span-12"><SectionHeader title="Activity Feed" /><div className="space-y-3 mt-6">{[1,2,3,4].map(i=><Skeleton key={i} className="h-12 w-full" />)}</div></Panel>;
  
  const feedItems = entries.slice(0, 6).map(e => {
    let text = '';
    if (e.type === 'CAPITAL_DEPOSIT') text = 'Capital Deposited';
    else if (e.type === 'MILESTONE_FUNDED') text = 'Milestone Funded';
    else if (e.type === 'SETTLEMENT') text = 'Settlement Completed';
    else if (e.type === 'MILESTONE_CLAIMED') text = 'Milestone Claimed';
    else text = e.type;

    return { id: e.id, text, project: e.projectName || 'System', time: new Date(e.timestamp).toLocaleTimeString() };
  });

  return (
    <Panel className="lg:col-span-4 col-span-12">
      <SectionHeader title="Activity Feed" />
      <div className="mt-6 space-y-2">
        {feedItems.length === 0 ? (
          <EmptyState icon={Activity} title="No events" description="Activity will appear here." />
        ) : (
          feedItems.map(item => (
            <div key={item.id} className="p-3 bg-elevated rounded-8">
              <p className="text-small font-medium text-text-main">{item.text}</p>
              <div className="flex justify-between mt-1">
                <p className="text-caption text-text-dim">{item.project}</p>
                <p className="text-caption text-text-dim">{item.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
};

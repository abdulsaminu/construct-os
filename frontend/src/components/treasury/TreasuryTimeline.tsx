import React from 'react';
import { LedgerEntry, Project } from '../../types';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { Timeline } from '../ui/Timeline';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';
import { money } from '../../lib/api';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface Props {
  entries: (LedgerEntry & { projectName?: string })[];
  isLoading: boolean;
}

export const TreasuryTimeline: React.FC<Props> = ({ entries, isLoading }) => {
  const treasuryEvents = entries.filter(e => e.type === 'CAPITAL_DEPOSIT' || e.type === 'SETTLEMENT');
  
  const timelineItems = treasuryEvents.slice(0, 6).map(e => ({
    id: e.id,
    title: e.type === 'CAPITAL_DEPOSIT' ? `Deposited ${money(e.amount)}` : `Settled ${money(e.amount)}`,
    subtitle: e.projectName ? `Project: ${e.projectName}` : undefined,
    time: new Date(e.timestamp).toLocaleTimeString(),
    icon: e.type === 'CAPITAL_DEPOSIT' ? <ArrowDownCircle size={16} className="text-primary" /> : <ArrowUpCircle size={16} className="text-success" />,
    iconBg: e.type === 'CAPITAL_DEPOSIT' ? 'bg-primary/20' : 'bg-success/20'
  }));

  return (
    <Panel className="col-span-8">
      <SectionHeader title="Treasury Timeline" />
      <div className="mt-6 min-h-[200px]">
        {isLoading ? (
          <div className="space-y-6 pl-8">
            {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : timelineItems.length === 0 ? (
          <EmptyState icon={ArrowDownCircle} title="No deposits" description="Deposit capital to begin funding construction projects." />
        ) : (
          <Timeline items={timelineItems} />
        )}
      </div>
    </Panel>
  );
};

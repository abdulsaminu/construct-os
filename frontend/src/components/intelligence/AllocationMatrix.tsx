import React from 'react';
import { AllocationRecommendation } from '../../types';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { EmptyState } from '../ui/EmptyState';
import { money } from '../../lib/api';
import { Target } from 'lucide-react';

interface Props {
  allocations: AllocationRecommendation[];
  isLoading: boolean;
}

export const AllocationMatrix: React.FC<Props> = ({ allocations, isLoading }) => {
  if (isLoading) return <Panel className="col-span-12"><div className="space-y-4">{[1,2,3].map(i=><div key={i} className="bg-elevated rounded-xl h-24 animate-pulse" />)}</div></Panel>;
  
  const getRecStyles = (rec: string) => {
    switch(rec) {
      case 'fund': return 'bg-success/20 text-success border-success/30';
      case 'watch': return 'bg-primary/20 text-primary border-primary/30';
      case 'hold': return 'bg-warning/20 text-warning border-warning/30';
      default: return 'bg-white/10 text-text-dim border-border-main';
    }
  };

  return (
    <Panel className="col-span-12">
      <SectionHeader title="Capital Allocation Matrix" />
      {allocations.length === 0 ? (
        <EmptyState icon={Target} title="No Active Allocations" description="No active projects require capital allocation." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {allocations.map(a => (
            <div key={a.projectId} className="bg-elevated rounded-2xl border border-border-main p-6 hover:-translate-y-0.5 transition-all duration-150 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-base font-semibold text-text-main pr-4">{a.projectName}</h4>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getRecStyles(a.recommendation)}`}>
                    {a.recommendation.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-text-dim mb-6">{a.reason}</p>
              </div>
              <div className="border-t border-border-main pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Allocation Score</span>
                  <span className="font-bold text-text-main">{a.score}/100</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Requestable Cap</span>
                  <span className="font-bold text-primary">{money(a.requestableCap)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
};

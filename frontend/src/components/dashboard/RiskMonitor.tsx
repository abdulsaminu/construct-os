import React from 'react';
import { RiskScore, AllocationRecommendation } from '../../types';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { EmptyState } from '../ui/EmptyState';
import { ShieldCheck } from 'lucide-react';

interface Props {
  risks: Record<string, RiskScore>;
  allocations: AllocationRecommendation[];
  projects: { id: string; name: string }[];
}

export const RiskMonitor: React.FC<Props> = ({ risks, allocations, projects }) => {
  const entries = Object.entries(risks);

  const getCategory = (score: number) => {
    if (score <= 30) return { text: 'Healthy', styles: 'bg-success/20 text-success' };
    if (score <= 60) return { text: 'Watch', styles: 'bg-primary/20 text-primary' };
    if (score <= 80) return { text: 'Warning', styles: 'bg-warning/20 text-warning' };
    return { text: 'Critical', styles: 'bg-danger/20 text-danger' };
  };

  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || 'Unknown Project';
  const getAllocation = (id: string) => allocations.find(a => a.projectId === id);

  return (
 <Panel className="lg:col-span-4 col-span-12">
      <SectionHeader title="Risk Monitor" />
      {entries.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No Active Risks" description="System is operating within normal parameters." />
      ) : (
 <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {entries.map(([id, r]) => {
            const category = getCategory(r.composite);
            const alloc = getAllocation(id);
            return (
 <div key={id} className="p-4 bg-elevated rounded-card border border-border-main">
 <div className="flex justify-between items-start mb-3">
 <p className="text-small font-medium text-text-main leading-tight pr-2">{getProjectName(id)}</p>
 <span className={`px-3 py-1 rounded-badge text-caption font-bold whitespace-nowrap ${category.styles}`}>
                    {category.text}
                  </span>
                </div>
 <div className="flex items-end justify-between">
                  <div>
 <p className="text-display font-bold text-text-main leading-none">{r.composite}</p>
 <p className="text-caption text-text-dim -mt-1">/ 100</p>
                  </div>
                  {alloc && (
 <p className="text-caption text-text-muted text-right max-w-[100px]">{alloc.reason}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
};

import React from 'react';
import { RiskScore } from '../../types';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { CategoryBadge } from '../ui/CategoryBadge';
import { EmptyState } from '../ui/EmptyState';
import { ShieldAlert } from 'lucide-react';

interface Props {
  risks: Record<string, RiskScore>;
  projectMap: Record<string, string>; // Maps ID -> Name
  isLoading: boolean;
}

export const RiskMatrixTable: React.FC<Props> = ({ risks, projectMap, isLoading }) => {
  const entries = Object.entries(risks);
  
 if (isLoading) return <Panel className="col-span-12"><div className="space-y-3">{[1,2,3].map(i=><div key={i} className="bg-elevated rounded-card h-14 animate-pulse" />)}</div></Panel>;

  return (
 <Panel className="col-span-12">
      <SectionHeader title="Risk Engine Matrix" />
      {entries.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="System Clear" description="No active projects currently being monitored." />
      ) : (
 <div className="overflow-x-auto">
 <caption className="sr-only">Risk assessment matrix</caption>
        <table className="w-full text-left">
            <thead>
 <tr className="border-b border-border-main text-text-dim text-label uppercase tracking-wider">
 <th scope="col" className="pb-3 font-medium pr-4">Project</th>
 <th scope="col" className="pb-3 font-medium px-4">Schedule</th>
 <th scope="col" className="pb-3 font-medium px-4">Liquidity</th>
 <th scope="col" className="pb-3 font-medium px-4">Funding</th>
 <th scope="col" className="pb-3 font-medium px-4">Contractor</th>
 <th scope="col" className="pb-3 font-medium px-4">Composite</th>
 <th scope="col" className="pb-3 font-medium pl-4">Category</th>
 <th scope="col" className="pb-3 font-medium pl-4">Trend</th>
              </tr>
            </thead>
 <tbody className="divide-y divide-border-main/50">
              {entries.map(([id, r]) => (
 <tr key={id} className="hover:bg-elevated/50 transition-colors">
 <td className="py-3 pr-4 text-body font-medium text-text-main whitespace-nowrap">
                    {projectMap[id] || `${id.substring(0, 8)}...`}
                  </td>
 <td className="py-3 px-4 text-body text-text-muted font-mono">{r.scheduleRisk}</td>
 <td className="py-3 px-4 text-body text-text-muted font-mono">{r.liquidityRisk}</td>
 <td className="py-3 px-4 text-body text-text-muted font-mono">{r.fundingRisk}</td>
 <td className="py-3 px-4 text-body text-text-muted font-mono">{r.contractorRisk}</td>
 <td className="py-3 px-4 text-body font-bold text-text-main font-mono">{r.composite}</td>
 <td className="py-3 pl-4"><CategoryBadge score={r.composite} /></td>
 <td className="py-3 pl-4 text-caption text-text-dim">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
};

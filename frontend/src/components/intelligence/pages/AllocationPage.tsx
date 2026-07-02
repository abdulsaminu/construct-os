
import React, { useState } from "react";
import { Panel } from "../../ui/Panel";
import { SectionHeader } from "../../ui/SectionHeader";
import { RecommendationBadge } from "../../ui/RecommendationBadge";
import { EmptyState } from "../../ui/EmptyState";
import { money } from "../../../lib/api";
import { Target } from "lucide-react";

interface AllocationPageProps {
  allocations: any[];
  isLoading: boolean;
}

export const AllocationPage: React.FC<AllocationPageProps> = ({ allocations, isLoading }) => {
  if (isLoading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-surface rounded-2xl border border-border-main p-6 h-24 animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <Panel className="col-span-12">
        <SectionHeader title="Capital Allocation Priority" />
        {allocations.length === 0 ? (
          <EmptyState icon={Target} title="No Allocation Recommendations" description="No active projects." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-main text-text-dim text-xs uppercase tracking-wider">
                  <th className="pb-3 font-medium pr-4">Rank</th>
                  <th className="pb-3 font-medium px-4">Project</th>
                  <th className="pb-3 font-medium px-4">Recommended Allocation</th>
                  <th className="pb-3 font-medium px-4">Confidence</th>
                  <th className="pb-3 font-medium pl-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/50">
                {allocations.map((a: any, i: number) => (
                  <tr key={a.projectId} className="hover:bg-elevated/50 transition-colors">
                    <td className="py-4 pr-4 text-sm font-bold text-text-dim">{i + 1}</td>
                    <td className="py-4 px-4 text-sm font-medium text-text-main">{a.projectName}</td>
                    <td className="py-4 px-4 text-sm font-semibold text-success">{money(a.requestableCap)}</td>
                    <td className="py-4 px-4 text-sm text-text-muted">94%</td>
                    <td className="py-4 pl-4 text-sm text-text-dim max-w-xs truncate">{a.reason}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {allocations.map((a: any) => (
          <Panel key={a.projectId}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-base font-semibold text-text-main pr-4">{a.projectName}</h3>
              <RecommendationBadge type={a.recommendation} />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-dim">Recommended</span>
                <span className="font-bold text-primary">{money(a.requestableCap)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-dim">Score</span>
                <span className="font-bold text-text-main">{a.score}/100</span>
              </div>
              <div className="pt-4 border-t border-border-main space-y-2">
                <p className="text-xs text-text-dim">Capital Distribution (TBD)</p>
                <div className="flex h-4 rounded-full overflow-hidden bg-elevated gap-1">
                  <div className="flex-1 bg-primary" title="Allocated" />
                </div>
              </div>
              <DecisionAccordion reason={a.reason} />
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
};

function DecisionAccordion({ reason }: { reason: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <button onClick={() => setOpen(!open)} className="w-full text-left text-xs text-primary hover:underline">
        {open ? "Hide" : "Why?"}
      </button>
      {open && <p className="mt-2 text-sm text-text-muted bg-elevated p-3 rounded-lg">{reason}</p>}
    </div>
  );
}


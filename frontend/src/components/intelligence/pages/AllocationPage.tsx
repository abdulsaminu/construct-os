import React, { useState } from 'react';
import { AllocationRecommendation, Economy } from '../../../types';
import { money } from '../../../lib/api';
import { Panel } from '../../ui/Panel';
import { SectionHeader } from '../../ui/SectionHeader';
import { RecommendationBadge } from '../../ui/RecommendationBadge';
import { ConfidenceBadge } from '../../ui/ConfidenceBadge';
import { EmptyState } from '../../ui/EmptyState';
import { Target, AlertTriangle, RefreshCw } from 'lucide-react';

interface AllocationPageProps {
  allocations: AllocationRecommendation[];
  economy: Economy | null;
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const AllocationPage: React.FC<AllocationPageProps> = ({ allocations, economy, isLoading, error, onRetry }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-surface rounded-2xl border border-border-main p-6 h-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface rounded-2xl border border-border-main p-6 h-56 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Panel>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle size={48} className="text-warning mb-4" />
          <h4 className="text-lg font-semibold text-text-main mb-2">Allocation Unavailable</h4>
          <p className="text-sm text-text-muted mb-6">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors text-sm"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          )}
        </div>
      </Panel>
    );
  }

  // Total available capital for proportional bar calculations — display only, no financial arithmetic
  const availableCapital = economy ? Number(economy.availableCapital) : 1;
  const totalRequestable = allocations.reduce((sum, a) => sum + Number(a.requestableCap), 0);

  return (
    <div className="space-y-6">
      {/* Priority Table */}
      <Panel>
        <SectionHeader
          title="Capital Allocation Priority"
          action={
            economy && (
              <span className="text-sm text-text-dim">
                Available: <span className="text-success font-semibold">{money(economy.availableCapital)}</span>
              </span>
            )
          }
        />
        {allocations.length === 0 ? (
          <EmptyState icon={Target} title="No Allocation Recommendations" description="No active projects require capital allocation." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" role="table" aria-label="Capital allocation priority table">
              <thead>
                <tr className="border-b border-border-main text-text-dim text-xs uppercase tracking-wider">
                  <th className="pb-3 font-medium pr-4" scope="col">Rank</th>
                  <th className="pb-3 font-medium px-4" scope="col">Project</th>
                  <th className="pb-3 font-medium px-4" scope="col">Recommended</th>
                  <th className="pb-3 font-medium px-4" scope="col">% of Available</th>
                  <th className="pb-3 font-medium px-4" scope="col">Confidence</th>
                  <th className="pb-3 font-medium pl-4" scope="col">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/50">
                {allocations.map((a, i) => {
                  // Proportional percentage of available capital — display formatting only
                  const pctOfAvailable = availableCapital > 0
                    ? ((Number(a.requestableCap) / availableCapital) * 100).toFixed(1)
                    : '0.0';

                  return (
                    <tr key={a.projectId} className="hover:bg-elevated/50 transition-colors" role="row">
                      <td className="py-4 pr-4 text-sm font-bold text-text-dim">{i + 1}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-text-main">{a.projectName}</span>
                          <RecommendationBadge type={a.recommendation} />
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-success">{money(a.requestableCap)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-elevated rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${Math.min(Number(pctOfAvailable), 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-text-muted font-mono">{pctOfAvailable}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4"><ConfidenceBadge value={a.score} /></td>
                      <td className="py-4 pl-4 text-sm text-text-dim max-w-xs truncate">{a.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Allocation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {allocations.map(a => {
          // Proportional bar width: this project's requestable cap as fraction of all requested
          const barPct = totalRequestable > 0
            ? (Number(a.requestableCap) / totalRequestable) * 100
            : 0;

          return (
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
                <div className="flex justify-between text-sm">
                  <span className="text-text-dim">Priority</span>
                  <span className={`font-bold text-xs uppercase ${
                    a.recommendation === 'fund' ? 'text-success' :
                    a.recommendation === 'watch' ? 'text-primary' :
                    a.recommendation === 'hold' ? 'text-warning' : 'text-text-dim'
                  }`}>
                    {a.recommendation === 'fund' ? 'High' :
                     a.recommendation === 'watch' ? 'Medium' :
                     a.recommendation === 'hold' ? 'Low' : 'None'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-dim">Confidence</span>
                  <ConfidenceBadge value={a.score} />
                </div>

                {/* Proportional Capital Distribution Bar — relative to total requested */}
                <div className="pt-4 border-t border-border-main space-y-2">
                  <p className="text-xs text-text-dim">Capital Distribution ({barPct.toFixed(1)}% of total requested)</p>
                  <div className="flex h-4 rounded-full overflow-hidden bg-elevated" aria-label={`${a.projectName} allocation bar`}>
                    <div
                      className="bg-primary rounded-full transition-all"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>

                <DecisionAccordion reason={a.reason} />
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
};

function DecisionAccordion({ reason }: { reason: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left text-xs text-primary hover:underline"
        aria-expanded={open}
      >
        {open ? 'Hide' : 'Why?'}
      </button>
      {open && (
        <p className="mt-2 text-sm text-text-muted bg-elevated p-3 rounded-lg">
          {reason}
        </p>
      )}
    </div>
  );
}
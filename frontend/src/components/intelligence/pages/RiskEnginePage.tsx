
import React, { useState } from "react";
import { Panel } from "../../ui/Panel";
import { SectionHeader } from "../../ui/SectionHeader";
import { CircularGauge } from "../../ui/CircularGauge";
import { CategoryBadge } from "../../ui/CategoryBadge";
import { RecommendationBadge } from "../../ui/RecommendationBadge";
import { EmptyState } from "../../ui/EmptyState";
import { ShieldAlert, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface RiskEnginePageProps {
  risks: Record<string, any>;
  projectMap: Record<string, string>;
  isLoading: boolean;
}

export const RiskEnginePage: React.FC<RiskEnginePageProps> = ({ risks, projectMap, isLoading }) => {
  const entries = Object.entries(risks);

  if (isLoading) return <div className="grid grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="bg-surface rounded-2xl border border-border-main p-6 h-48 animate-pulse" />}</div>;

  const highestRisk = entries.length > 0 ? entries.reduce((max, curr) => curr[1].composite > max[1].composite ? curr : max, entries[0]) : null;
  const lowestRisk = entries.length > 0 ? entries.reduce((min, curr) => curr[1].composite < min[1].composite ? curr : min, entries[0]) : null;

  const getTrendIcon = (score: number) => {
    if (score > 70) return <TrendingUp size={16} className="text-danger" />;
    if (score < 30) return <TrendingDown size={16} className="text-success" />;
    return <Minus size={16} className="text-text-dim" />;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Panel>
          <p className="text-text-dim text-xs uppercase tracking-wide mb-4">Highest Risk</p>
          {highestRisk ? (
            <div className="flex items-center gap-4">
              <CircularGauge value={highestRisk[1].composite} size={80} />
              <div>
                <p className="text-sm font-semibold text-text-main">{projectMap[highestRisk[0]] || "Unknown"}</p>
                <p className="text-xs text-text-dim">Composite Score</p>
              </div>
            </div>
          ) : <div className="h-20 flex items-center justify-center text-text-dim">-</div>}
        </Panel>
        <Panel>
          <p className="text-text-dim text-xs uppercase tracking-wide mb-4">Lowest Risk</p>
          {lowestRisk ? (
            <div className="flex items-center gap-4">
              <CircularGauge value={lowestRisk[1].composite} size={80} />
              <div>
                <p className="text-sm font-semibold text-text-main">{projectMap[lowestRisk[0]] || "Unknown"}</p>
                <p className="text-xs text-text-dim">Composite Score</p>
              </div>
            </div>
          ) : <div className="h-20 flex items-center justify-center text-text-dim">-</div>}
        </Panel>
        <Panel>
          <p className="text-text-dim text-xs uppercase tracking-wide mb-4">Projects Monitored</p>
          <p className="text-[36px] font-bold text-text-main leading-none">{entries.length}</p>
        </Panel>
      </div>

      <Panel className="col-span-12">
        <SectionHeader title="Project Risk Matrix" />
        {entries.length === 0 ? (
          <EmptyState icon={ShieldAlert} title="No Projects Available" description="Risk engine waiting." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-main text-text-dim text-xs uppercase tracking-wider">
                  <th className="pb-3 font-medium pr-4">Project</th>
                  <th className="pb-3 font-medium px-4">Risk Score</th>
                  <th className="pb-3 font-medium px-4">Funding</th>
                  <th className="pb-3 font-medium px-4">Milestones</th>
                  <th className="pb-3 font-medium px-4">Trend</th>
                  <th className="pb-3 font-medium px-4">Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/50">
                {entries.map(([id, r]: [string, any]) => {
                  const pName = projectMap[id] || "Unknown";
                  const fundingStatus = r.fundingRisk > 70 ? "High" : r.fundingRisk > 30 ? "Medium" : "Low";
                  return (
                    <tr key={id} className="hover:bg-elevated/50 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-4">
                          <CircularGauge value={r.composite} size={48} stroke={4} />
                          <span className="text-sm font-medium text-text-main">{pName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4"><CategoryBadge score={r.composite} /></td>
                      <td className="py-4 px-4 text-sm text-text-muted">{fundingStatus}</td>
                      <td className="py-4 px-4 text-sm text-text-muted">-</td>
                      <td className="py-4 px-4">{getTrendIcon(r.composite)}</td>
                      <td className="py-4 px-4"><RecommendationBadge type={r.composite > 70 ? "skip" : r.composite > 40 ? "hold" : "fund"} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {highestRisk && (
        <Panel className="col-span-12">
          <SectionHeader title="Risk Breakdown" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RiskBreakdownCard title={projectMap[highestRisk[0]] || "Unknown"} scores={highestRisk[1]} />
          </div>
        </Panel>
      )}
    </div>
  );
};

function RiskBreakdownCard({ title, scores }: { title: string; scores: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const items = [
    { label: "Schedule", value: scores.scheduleRisk },
    { label: "Liquidity", value: scores.liquidityRisk },
    { label: "Funding", value: scores.fundingRisk },
    { label: "Contractor", value: scores.contractorRisk },
    { label: "Settlement", value: scores.composite },
  ];
  return (
    <div className="bg-elevated rounded-2xl border border-border-main p-6">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex justify-between items-center text-left">
        <span className="text-base font-semibold text-text-main">{title}</span>
        <span className="text-text-dim text-sm">{isExpanded ? "Collapse" : "Expand"}</span>
      </button>
      {isExpanded && (
        <div className="mt-6 space-y-4 pt-6 border-t border-border-main">
          {items.map((item: any) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-muted">{item.label}</span>
                <span className="font-bold text-text-main">{item.value}/100</span>
              </div>
              <div className="w-full bg-surface rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${item.value > 70 ? "bg-danger" : item.value > 40 ? "bg-warning" : "bg-success"}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


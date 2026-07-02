import React, { useState } from 'react';
import { RiskScore } from '../../../types';
import { Panel } from '../../ui/Panel';
import { SectionHeader } from '../../ui/SectionHeader';
import { CircularGauge } from '../../ui/CircularGauge';
import { CategoryBadge } from '../../ui/CategoryBadge';
import { RecommendationBadge } from '../../ui/RecommendationBadge';
import { RiskBadge } from '../../ui/RiskBadge';
import { RiskBreakdownPanel } from '../RiskBreakdownPanel';
import { EmptyState } from '../../ui/EmptyState';
import { ShieldAlert, TrendingUp, TrendingDown, Minus, BarChart3, AlertTriangle, RefreshCw } from 'lucide-react';

interface RiskEnginePageProps {
  risks: Record<string, RiskScore>;
  projectMap: Record<string, string>;
  projects: { id: string; milestones: { funded: boolean; claimed: boolean; settled: boolean; name?: string }[] }[];
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const RiskEnginePage: React.FC<RiskEnginePageProps> = ({ risks, projectMap, projects, isLoading, error, onRetry }) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [expandedAll, setExpandedAll] = useState(false);
  const entries = Object.entries(risks);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-surface rounded-2xl border border-border-main p-6 h-36 animate-pulse" />
          ))}
        </div>
        <div className="bg-surface rounded-2xl border border-border-main p-6 h-64 animate-pulse" />
        <div className="bg-surface rounded-2xl border border-border-main p-6 h-48 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <Panel>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle size={48} className="text-warning mb-4" />
          <h4 className="text-lg font-semibold text-text-main mb-2">Risk Engine Unavailable</h4>
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

  const highestRisk = entries.length > 0
    ? entries.reduce((max, curr) => curr[1].composite > max[1].composite ? curr : max, entries[0])
    : null;
  const lowestRisk = entries.length > 0
    ? entries.reduce((min, curr) => curr[1].composite < min[1].composite ? curr : min, entries[0])
    : null;

  // Count total milestones across monitored projects
  const totalMilestones = entries.reduce((sum, [id]) => {
    const p = projects.find(proj => proj.id === id);
    return sum + (p?.milestones.length || 0);
  }, 0);
  const fundedMilestones = entries.reduce((sum, [id]) => {
    const p = projects.find(proj => proj.id === id);
    return sum + (p?.milestones.filter(m => m.funded).length || 0);
  }, 0);

  const getTrendIcon = (score: number) => {
    // No historical data — all trends are unknown
    return <Minus size={16} className="text-text-dim" aria-label="Trend unknown" />;
  };

  const getFundingStatus = (score: number) => {
    if (score > 70) return 'High';
    if (score > 30) return 'Medium';
    return 'Low';
  };

  const getMilestoneStatus = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return '—';
    const total = project.milestones.length;
    const funded = project.milestones.filter(m => m.funded).length;
    const claimed = project.milestones.filter(m => m.claimed).length;
    const settled = project.milestones.filter(m => m.settled).length;
    return `${funded}/${claimed}/${settled}/${total}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Panel>
          <p className="text-text-dim text-xs uppercase tracking-wide mb-4">Portfolio Risk</p>
          {highestRisk ? (
            <div className="flex items-center gap-4">
              <CircularGauge value={highestRisk[1].composite} size={72} stroke={6} />
              <div>
                <p className="text-sm font-semibold text-text-main">{projectMap[highestRisk[0]] || 'Unknown'}</p>
                <RiskBadge score={highestRisk[1].composite} />
              </div>
            </div>
          ) : (
            <div className="h-20 flex items-center justify-center text-text-dim">—</div>
          )}
        </Panel>

        <Panel>
          <p className="text-text-dim text-xs uppercase tracking-wide mb-4">Lowest Risk</p>
          {lowestRisk ? (
            <div className="flex items-center gap-4">
              <CircularGauge value={lowestRisk[1].composite} size={72} stroke={6} />
              <div>
                <p className="text-sm font-semibold text-text-main">{projectMap[lowestRisk[0]] || 'Unknown'}</p>
                <RiskBadge score={lowestRisk[1].composite} />
              </div>
            </div>
          ) : (
            <div className="h-20 flex items-center justify-center text-text-dim">—</div>
          )}
        </Panel>

        <Panel>
          <p className="text-text-dim text-xs uppercase tracking-wide mb-4">Milestones Tracked</p>
          <p className="text-[44px] font-bold text-text-main leading-none">{fundedMilestones}<span className="text-xl text-text-dim font-normal">/{totalMilestones}</span></p>
          <p className="text-[13px] text-text-muted mt-2">Funded of total monitored</p>
        </Panel>

        <Panel>
          <p className="text-text-dim text-xs uppercase tracking-wide mb-4">Highest Score</p>
          <p className="text-[44px] font-bold text-text-main leading-none">{highestRisk ? highestRisk[1].composite : '—'}</p>
          <p className="text-[13px] text-text-muted mt-2">Out of 100</p>
        </Panel>
      </div>

      {/* Risk Matrix Table */}
      <Panel>
        <SectionHeader title="Project Risk Matrix" />
        {entries.length === 0 ? (
          <EmptyState icon={ShieldAlert} title="No Projects Available" description="Risk engine waiting for active projects." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" role="table" aria-label="Project risk matrix">
              <thead>
                <tr className="border-b border-border-main text-text-dim text-xs uppercase tracking-wider">
                  <th className="pb-3 font-medium pr-4" scope="col">Project</th>
                  <th className="pb-3 font-medium px-4" scope="col">Risk Score</th>
                  <th className="pb-3 font-medium px-4" scope="col">Funding</th>
                  <th className="pb-3 font-medium px-4" scope="col">Milestones</th>
                  <th className="pb-3 font-medium px-4" scope="col">Trend</th>
                  <th className="pb-3 font-medium px-4" scope="col">Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/50">
                {entries.map(([id, r]) => {
                  const pName = projectMap[id] || 'Unknown';
                  return (
                    <tr
                      key={id}
                      className={`hover:bg-elevated/50 transition-colors cursor-pointer ${selectedProject === id ? 'bg-elevated/30' : ''}`}
                      onClick={() => setSelectedProject(selectedProject === id ? null : id)}
                      role="row"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') setSelectedProject(selectedProject === id ? null : id); }}
                    >
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-4">
                          <CircularGauge value={r.composite} size={48} stroke={4} />
                          <span className="text-sm font-medium text-text-main">{pName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <CategoryBadge score={r.composite} />
                          <span className="text-sm font-bold text-text-main font-mono">{r.composite}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-text-muted">{getFundingStatus(r.fundingRisk)}</td>
                      <td className="py-4 px-4 text-sm text-text-muted font-mono">{getMilestoneStatus(id)}</td>
                      <td className="py-4 px-4">{getTrendIcon(r.composite)}</td>
                      <td className="py-4 px-4">
                        <RecommendationBadge type={r.composite > 70 ? 'skip' : r.composite > 40 ? 'hold' : 'fund'} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* All-Project Risk Breakdown — expandable drill-down for every project */}
      {entries.length > 0 && (
        <Panel>
          <SectionHeader
            title="Risk Breakdown — All Projects"
            action={
              <button
                onClick={() => setExpandedAll(!expandedAll)}
                className="text-xs text-primary hover:underline"
              >
                {expandedAll ? 'Collapse All' : 'Expand All'}
              </button>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entries.map(([id, scores]) => (
              <RiskBreakdownPanel
                key={id}
                projectName={projectMap[id] || 'Unknown'}
                scores={scores}
                defaultExpanded={expandedAll || selectedProject === id}
              />
            ))}
          </div>
        </Panel>
      )}

      {/* Historical Trend — future ready placeholder */}
      <Panel>
        <SectionHeader title="Historical Trend" />
        <div className="bg-elevated rounded-xl p-8 text-center">
          <BarChart3 size={32} className="mx-auto mb-3 text-text-dim opacity-50" />
          <p className="text-text-muted">Historical data unavailable.</p>
          <p className="text-xs text-text-dim mt-1">Future endpoint will provide time-series risk data.</p>
        </div>
      </Panel>
    </div>
  );
};
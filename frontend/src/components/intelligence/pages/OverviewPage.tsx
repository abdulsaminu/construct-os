
export interface OverviewPageProps {
  economy: any;
  projects: any[];
  private allocations: any[];
  isLoading: boolean;
}

import { money } from "../../../lib/api";
import { MetricCard } from "../../ui/MetricCard";
import { RecommendationBadge } from "../../ui/RecommendationBadge";
import { EmptyState } from "../../ui/EmptyState";
import { Wallet, ShieldAlert, AlertTriangle, DollarSign, BarChart3, Database, TrendingUp, Zap } from "lucide-react";

export const OverviewPage: React.FC<OverviewPageProps> = ({ economy, projects, allocations, isLoading }) => {
  if (isLoading) return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">{[1,2,3,4,5,6].map(i => <div key={i} className="bg-surface rounded-2xl border border-border-main h-32 animate-pulse" />)}</div>;

  const activeProjects = projects.filter((p: any) => p.status !== "completed").length;
  const topAllocations = allocations.slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="bg-surface rounded-2xl border border-border-main p-8 flex items-center justify-between">
        <div>
          <h1 className="text-[48px] font-bold text-text-main leading-none">CFEL Intelligence</h1>
          <p className="text-lg text-text-muted mt-2">Construction Finance Economic Layer</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-success"></div>
            <span className="text-sm font-medium text-success">Healthy</span>
          </div>
          <p className="text-xs text-text-dim">Live Engine • Synced 10s ago</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <MetricCard title="Total Capital" value={economy ? money(economy.totalCapital) : "---"} icon={Wallet} color="text-primary" />
        <MetricCard title="Available Liquidity" value={economy ? money(economy.availableCapital) : "---"} icon={TrendingUp} color="text-success" />
        <MetricCard title="Active Exposure" value={economy ? money(economy.lockedCapital) : "---"} icon={AlertTriangle} color="text-warning" />
        <MetricCard title="Settled Capital" value={economy ? money(economy.settledCapital) : "---"} icon={DollarSign} color="text-success" />
        <MetricCard title="Active Projects" value={String(activeProjects)} icon={ShieldAlert} color="text-primary" />
        <MetricCard title="System Allocations" value={String(allocations.length)} icon={BarChart3} color="text-primary" />
      </div>

      <div className="bg-surface rounded-2xl border border-border-main p-8">
        <h2 className="text-2xl font-semibold text-text-main mb-6">Recommended Actions</h2>
        {topAllocations.length === 0 ? (
          <EmptyState icon={Zap} title="No Actions" description="System is idle." />
        ) : (
          <div className="space-y-4">
            {topAllocations.map((a: any, i: number) => (
              <div key={a.projectId} className="flex items-center justify-between p-4 bg-elevated rounded-xl border border-border-main hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-text-dim w-8">{i + 1}.</span>
                  <div>
                    <p className="font-semibold text-text-main">{a.recommendation === "fund" ? "Fund " + a.projectName : a.recommendation === "watch" ? "Monitor " + a.projectName : "Review " + a.projectName}</p>
                    <p className="text-sm text-text-dim">Reason: {a.reason}</p>
                  </div>
                </div>
                <RecommendationBadge type={a.recommendation} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-surface rounded-2xl border border-border-main p-8">
        <h2 className="text-2xl font-semibold text-text-main mb-6">Intelligence Feed</h2>
        <div className="space-y-0 pl-8 border-l-2 border-border-main ml-4">
          {topAllocations.map((a: any) => (
            <div key={"feed-" + a.projectId} className="relative py-4 pl-8 -ml-[41px]">
              <div className="absolute -left-[41px] top-4 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Zap size={14} />
              </div>
              <p className="text-sm font-medium text-text-main">Allocation Updated: {a.projectName}</p>
              <p className="text-xs text-text-dim mt-1">Recommendation: {a.recommendation.toUpperCase()}</p>
            </div>
          ))}
          <div className="relative py-4 pl-8 -ml-[41px]">
            <div className="absolute -left-[41px] top-4 w-8 h-8 rounded-full bg-success/20 flex items-center justify-center text-success">
              <Database size={14} />
            </div>
            <p className="text-sm font-medium text-text-main">System Synced</p>
            <p className="text-xs text-text-dim mt-1">Fetched latest CFEL state</p>
          </div>
        </div>
      </div>
    </div>
  );
};


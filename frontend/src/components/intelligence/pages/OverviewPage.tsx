import React, { useMemo } from 'react';
import { Economy, Project, AllocationRecommendation, RiskScore, LedgerEntry, Contractor } from '../../../types';
import { money } from '../../../lib/api';
import { MetricCard } from '../../ui/MetricCard';
import { RecommendationBadge } from '../../ui/RecommendationBadge';
import { RiskBadge } from '../../ui/RiskBadge';
import { EmptyState } from '../../ui/EmptyState';
import { Panel } from '../../ui/Panel';
import { SectionHeader } from '../../ui/SectionHeader';
import { HealthBadge } from '../../ui/HealthBadge';
import {
  Wallet, ShieldAlert, AlertTriangle, DollarSign,
  BarChart3, TrendingUp, Zap, Activity, Landmark,
  Coins, ArrowDownCircle, ArrowUpCircle, BrainCircuit
} from 'lucide-react';

interface OverviewPageProps {
  economy: Economy | null;
  projects: Project[];
  allocations: AllocationRecommendation[];
  risks: Record<string, RiskScore>;
  contractors: Contractor[];
  ledgerEntries: LedgerEntry[];
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  economy, projects, allocations, risks, contractors, ledgerEntries, isLoading, error, onRetry
}) => {
  if (isLoading) {
    return (
 <div className="space-y-8">
 <div className="bg-surface rounded-card border border-border-main p-8 h-28 animate-pulse" />
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
 <div key={i} className="bg-surface rounded-card border border-border-main h-36 animate-pulse" />
          ))}
        </div>
 <div className="bg-surface rounded-card border border-border-main p-8 h-64 animate-pulse" />
 <div className="bg-surface rounded-card border border-border-main p-8 h-64 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <Panel>
 <div className="flex flex-col items-center justify-center py-12 text-center">
 <AlertTriangle aria-hidden='true' size={32} className="text-warning mb-4" />
 <h4 className="text-body-lg font-semibold text-text-main mb-2">Intelligence Unavailable</h4>
 <p className="text-small text-text-muted mb-6">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
 className="inline-flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-btn font-semibold hover:bg-primary-hover transition-colors text-small"
            >
              <Zap aria-hidden='true' size={16} />
              Retry
            </button>
          )}
        </div>
      </Panel>
    );
  }

  const activeProjects = projects.filter(p => p.status !== 'completed');
  const riskEntries = Object.entries(risks);
  const fundRecommendations = allocations.filter(a => a.recommendation === 'fund');

  // Pending settlements: milestones claimed but not settled — state scanning, no math
  let pendingSettlements = 0;
  projects.forEach(p => {
    p.milestones.forEach(m => {
      if (m.claimed && !m.settled) pendingSettlements++;
    });
  });

  // System health — derived from data availability, no calculations
  const systemHealth = deriveSystemHealth(projects, contractors, ledgerEntries);

  // Build executive recommendations from backend data
  const recommendations = buildRecommendations(allocations, risks, projects, pendingSettlements);

  // Real ledger events feed — sorted by timestamp descending
  const recentLedger = [...ledgerEntries]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 12);

  // Project name lookup
  const projectMap = useMemo(() => {
    const m: Record<string, string> = {};
    projects.forEach(p => { m[p.id] = p.name; });
    return m;
  }, [projects]);

  // Contractor name lookup
  const contractorMap = useMemo(() => {
    const m: Record<string, string> = {};
    contractors.forEach(c => { m[c.id] = c.name; });
    return m;
  }, [contractors]);

  return (
 <div className="space-y-8">
      {/* Hero with System Health Indicator */}
 <div className="bg-surface rounded-card border border-border-main p-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <BrainCircuit size={28} className="text-primary" strokeWidth={2} />
          <div>
 <h1 className="text-page-title text-text-main leading-none">CFEL Intelligence</h1>
 <p className="text-small text-text-muted mt-2">Construction Finance Economic Layer</p>
          </div>
        </div>
 <div className="text-right flex flex-col items-end gap-1">
          <HealthBadge status={systemHealth.status} />
 <p className="text-caption text-text-dim">{systemHealth.detail}</p>
        </div>
      </div>

      {/* Summary Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
        <MetricCard title="Total Capital" value={economy ? money(economy.totalCapital) : '---'} footer="Capital deposited" icon={Wallet} color="text-primary" />
        <MetricCard title="Available Liquidity" value={economy ? money(economy.availableCapital) : '---'} footer="Available for funding" icon={TrendingUp} color="text-success" />
        <MetricCard title="Active Exposure" value={economy ? money(economy.lockedCapital) : '---'} footer="Awaiting completion" icon={AlertTriangle} color="text-warning" />
        <MetricCard title="Settled Capital" value={economy ? money(economy.settledCapital) : '---'} footer="Blockchain confirmed" icon={DollarSign} color="text-success" />
        <MetricCard title="Active Projects" value={String(activeProjects.length)} footer="Under execution" icon={ShieldAlert} color="text-primary" />
        <MetricCard title="Fund Signals" value={String(fundRecommendations.length)} footer={`${allocations.length} total signals`} icon={BarChart3} color="text-primary" />
      </div>

      {/* Executive Recommendations */}
      <Panel>
        <SectionHeader title="Recommended Actions" />
        {recommendations.length === 0 ? (
          <EmptyState icon={Zap} title="No Actions" description="System is idle. All projects are on track." />
        ) : (
 <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <div
                key={i}
 className="flex items-center justify-between p-4 bg-elevated rounded-card border border-border-main hover:bg-elevated transition-colors"
              >
 <div className="flex items-center gap-4">
 <span className="text-h3 font-bold text-text-dim w-8">{i + 1}.</span>
                  <div>
 <p className="font-semibold text-text-main">{rec.title}</p>
 <div className="flex items-center gap-3 mt-1">
 {rec.subtitle && <span className="text-small text-text-muted">{rec.subtitle}</span>}
                      {rec.riskBadge !== undefined && <RiskBadge score={rec.riskBadge} />}
                    </div>
                  </div>
                </div>
                <RecommendationBadge type={rec.badge} />
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Real Ledger Events Feed */}
      <Panel>
        <SectionHeader
          title="Ledger Events"
 action={<span className="text-caption text-text-dim">{ledgerEntries.length} total entries</span>}
        />
        {recentLedger.length === 0 ? (
          <EmptyState icon={Activity} title="No Ledger Events" description="No financial events recorded yet." />
        ) : (
 <div className="space-y-0 pl-8 border-l-2 border-border-main ml-4 max-h-[400px] overflow-y-auto">
            {recentLedger.map((entry) => {
              const evt = formatLedgerEvent(entry, projectMap, contractorMap);
              return (
 <div key={entry.id} className="relative py-4 pl-8 -ml-[41px]">
 <div className={`absolute -left-[41px] top-4 w-8 h-8 rounded-full flex items-center justify-center ${evt.dotBg}`}>
 <evt.icon size={16} className={evt.dotColor} />
                  </div>
 <p className="text-small font-medium text-text-main">{evt.text}</p>
 <div className="flex items-center gap-3 mt-1">
 <p className="text-caption text-text-dim">{evt.time}</p>
                    {entry.amount && (
 <span className={`text-caption font-semibold ${evt.amountColor}`}>{money(entry.amount)}</span>
                    )}
                    {entry.metadata?.txHash && (
 <span className="text-micro text-text-dim font-mono">tx: {entry.metadata.txHash.substring(0, 10)}...</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
};

/* ---- Pure helpers. No financial calculations. ---- */

interface SystemHealthInfo {
  status: 'Healthy' | 'Warning' | 'Offline' | 'Syncing';
  detail: string;
}

function deriveSystemHealth(projects: Project[], contractors: Contractor[], ledgerEntries: LedgerEntry[]): SystemHealthInfo {
  const hasActive = projects.some(p => p.status !== 'completed');
  const hasPendingSettlements = projects.some(p => p.milestones.some(m => m.claimed && !m.settled));

  if (hasPendingSettlements) {
    return { status: 'Syncing', detail: `${projects.filter(p => p.milestones.some(m => m.claimed && !m.settled)).length} settlement(s) pending` };
  }
  if (hasActive && ledgerEntries.length > 0 && contractors.length > 0) {
    return { status: 'Healthy', detail: `${projects.length} projects · ${ledgerEntries.length} entries · ${contractors.length} contractors` };
  }
  if (ledgerEntries.length === 0) {
    return { status: 'Warning', detail: 'No ledger entries recorded' };
  }
  return { status: 'Healthy', detail: 'All services operational' };
}

interface Recommendation {
  title: string;
  subtitle?: string;
  riskBadge?: number;
  badge: 'fund' | 'watch' | 'hold' | 'skip';
}

function buildRecommendations(
  allocations: AllocationRecommendation[],
  risks: Record<string, RiskScore>,
  projects: Project[],
  pendingSettlements: number
): Recommendation[] {
  const recs: Recommendation[] = [];

  // Fund recommendations
  for (const a of allocations) {
    if (a.recommendation === 'fund') {
      const risk = risks[a.projectId];
      recs.push({
        title: `Fund ${a.projectName}`,
        subtitle: `Recommended: ${money(a.requestableCap)}`,
        riskBadge: risk?.composite,
        badge: 'fund',
      });
    }
  }

  // High risk / skip recommendations
  for (const a of allocations) {
    if (a.recommendation === 'skip' || a.recommendation === 'hold') {
      const risk = risks[a.projectId];
      recs.push({
        title: `Review ${a.projectName}`,
        subtitle: a.reason,
        riskBadge: risk?.composite,
        badge: a.recommendation,
      });
    }
  }

  // Pending settlements
  if (pendingSettlements > 0) {
    recs.push({
      title: 'Complete Settlement',
      subtitle: `${pendingSettlements} milestone${pendingSettlements > 1 ? 's' : ''} awaiting settlement`,
      badge: 'watch',
    });
  }

  return recs.slice(0, 6);
}

interface FormattedLedgerEvent {
  text: string;
  time: string;
  icon: React.ElementType;
  dotBg: string;
  dotColor: string;
  amountColor: string;
}

function formatLedgerEvent(
  entry: LedgerEntry,
  projectMap: Record<string, string>,
  contractorMap: Record<string, string>
): FormattedLedgerEvent {
  const projectName = projectMap[entry.projectId] || 'Unknown Project';
  const milestoneName = entry.metadata?.milestoneName || '';
  const time = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '';

  switch (entry.type) {
    case 'CAPITAL_DEPOSIT':
      return {
        text: `Capital deposited${projectName !== 'Unknown Project' ? ` — ${projectName}` : ''}`,
        time,
        icon: ArrowDownCircle,
        dotBg: 'bg-success/20',
        dotColor: 'text-success',
        amountColor: 'text-success',
      };
    case 'MILESTONE_FUNDED':
      return {
        text: `Milestone funded: ${milestoneName || entry.milestoneId?.substring(0, 8) || 'Unknown'} (${projectName})`,
        time,
        icon: Coins,
        dotBg: 'bg-primary/20',
        dotColor: 'text-primary',
        amountColor: 'text-warning',
      };
    case 'MILESTONE_CLAIMED': {
      const contractorName = entry.payeeId ? (contractorMap[entry.payeeId] || entry.payeeId.substring(0, 8)) : '';
      return {
        text: `Milestone claimed: ${milestoneName || 'Unknown'} (${projectName})${contractorName ? ` by ${contractorName}` : ''}`,
        time,
        icon: ArrowUpCircle,
        dotBg: 'bg-warning/20',
        dotColor: 'text-warning',
        amountColor: 'text-warning',
      };
    }
    case 'SETTLEMENT':
      return {
        text: `Settlement confirmed: ${milestoneName || 'Unknown'} (${projectName})${entry.metadata?.txHash ? ` — on-chain` : ''}`,
        time,
        icon: Landmark,
        dotBg: 'bg-success/20',
        dotColor: 'text-success',
        amountColor: 'text-success',
      };
    default:
      return {
        text: `${entry.type} — ${projectName}`,
        time,
        icon: Activity,
        dotBg: 'bg-elevated',
        dotColor: 'text-text-dim',
        amountColor: 'text-text-muted',
      };
  }
}
import React from 'react';
import { Project, Contractor, ServiceStatus } from '../../types';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { HealthBadge } from '../ui/HealthBadge';
import { MetricCard } from '../ui/MetricCard';
import { Activity, Database, Landmark, TrendingUp, Users, ScrollText, AlertTriangle } from 'lucide-react';

interface Props {
  projects: Project[];
  contractors: Contractor[];
  ledgerEntryCount: number;
  /** Timestamps from when each API call completed — used to derive latency */
  apiLatencyMs: {
    economy: number;
    projects: number;
    risk: number;
    allocations: number;
    forecast: number;
    contractors: number;
  };
}

// Phase 4: Replaced fake ITOps services with Deterministic AI Health Math
function deriveServices(projects: Project[], contractors: Contractor[], ledgerEntryCount: number, latency: Props['apiLatencyMs']): ServiceStatus[] {
  return projects
    .filter(p => p.status !== 'completed')
    .map(p => {
      const total = p.milestones.length || 1;
      const claimed = p.milestones.filter(m => m.claimed || m.settled).length;
      const totalDuration = p.estimatedDurationDays || (total * 30);
      const daysElapsed = Math.max(0, Math.floor((Date.now() - p.createdAt) / (1000 * 60 * 60 * 24)));
      const expectedProgress = totalDuration > 0 ? (daysElapsed / totalDuration) * 100 : 0;
      const actualProgress = (claimed / total) * 100;
      const variance = actualProgress - expectedProgress;
      const daysLeft = Math.max(0, totalDuration - daysElapsed);

      // Map directly to HealthBadge accepted strings: 'Healthy', 'Warning', 'Offline'
      let status: 'Healthy' | 'Warning' | 'Offline' | 'Syncing' = 'Healthy';
      if (variance < -20) status = 'Offline';     // Delayed (>20% behind)
      else if (variance < -10) status = 'Warning'; // At Risk (10-20% behind)

      // Cleverly reuse the 'latency' string field to show Variance & Days Remaining
      const varianceStr = `${variance > 0 ? '+' : ''}${Math.round(variance)}% · ${daysLeft}d left`;

      return { name: p.name, status, latency: varianceStr };
    });
}

export const ServiceStatusGrid: React.FC<Props> = ({ projects, contractors, ledgerEntryCount, apiLatencyMs }) => {
  const services = deriveServices(projects, contractors, ledgerEntryCount, apiLatencyMs);
  const timelineEvents = buildTimeline(projects);

  const healthyCount = services.filter(s => s.status === 'Healthy').length;
  const warningCount = services.filter(s => s.status === 'Warning' || s.status === 'Offline').length;

  return (
    <div className="space-y-6">
      {/* Project Health Monitor */}
      <Panel>
        <SectionHeader
          title="Project Health Monitor"
          action={
            <div className="flex items-center gap-4 text-caption">
              <span className="flex items-center gap-2 text-success"><div className="w-2 h-2 rounded-full bg-success" />{healthyCount} Healthy</span>
              {warningCount > 0 && (
                <span className="flex items-center gap-2 text-warning"><div className="w-2 h-2 rounded-full bg-warning" />{warningCount} At Risk / Delayed</span>
              )}
            </div>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map(s => {
            const Icon = s.status === 'Offline' ? AlertTriangle : TrendingUp;
            return (
              <div
                key={s.name}
                className="flex items-center justify-between p-4 bg-elevated rounded-card border border-border-main"
              >
                <div className="flex items-center gap-3">
                  <Icon aria-hidden='true' size={16} className="text-text-dim" />
                  <div>
                    <span className="text-small font-medium text-text-main block">{s.name}</span>
                    <HealthBadge status={s.status} />
                  </div>
                </div>
                <span className="text-caption text-text-dim font-mono">{s.latency}</span>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Real KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <MetricCard
          title="Ledger Entries"
          value={String(ledgerEntryCount)}
          footer="Immutable records"
          icon={ScrollText}
          color="text-primary"
        />
        <MetricCard
          title="Projects"
          value={String(projects.length)}
          footer={`${projects.filter(p => p.status !== 'completed').length} active`}
          icon={Database}
          color="text-primary"
        />
        <MetricCard
          title="Contractors"
          value={String(contractors.length)}
          footer="Registered payees"
          icon={Users}
          color="text-primary"
        />
      </div>

      {/* Construction Activity Timeline */}
      <Panel>
        <SectionHeader title="Construction Activity" />
        {timelineEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity aria-hidden='true' size={32} className="text-text-dim mb-3" />
            <p className="text-small text-text-muted">No recent activity.</p>
          </div>
        ) : (
          <div className="space-y-0 pl-8 border-l-2 border-border-main ml-4 max-h-[400px] overflow-y-auto">
            {timelineEvents.map((evt, i) => (
              <div key={i} className="relative py-4 pl-8 -ml-[41px]">
                <div className={`absolute -left-[41px] top-4 w-8 h-8 rounded-full flex items-center justify-center ${evt.dotBg}`}>
                  <evt.icon size={16} className={evt.dotColor} />
                </div>
                <p className="text-small font-medium text-text-main">{evt.text}</p>
                <p className="text-caption text-text-dim mt-1">{evt.time}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
};

interface TimelineEvent {
  text: string;
  time: string;
  icon: React.ElementType;
  dotBg: string;
  dotColor: string;
}

function buildTimeline(projects: Project[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const allEvents: { text: string; time: string; timestamp: number; icon: React.ElementType; dotBg: string; dotColor: string }[] = [];

  for (const p of projects) {
    for (const m of p.milestones) {
      if (m.settled && m.claimedAt) {
        allEvents.push({
          text: `Settlement executed: ${m.name} (${p.name})`,
          time: new Date(m.claimedAt).toLocaleString(),
          timestamp: m.claimedAt,
          icon: Landmark,
          dotBg: 'bg-success/20',
          dotColor: 'text-success',
        });
      } else if (m.claimed && !m.settled) {
        allEvents.push({
          text: `Awaiting settlement: ${m.name} (${p.name})`,
          time: m.claimedAt ? new Date(m.claimedAt).toLocaleString() : '',
          timestamp: m.claimedAt || 0,
          icon: TrendingUp,
          dotBg: 'bg-warning/20',
          dotColor: 'text-warning',
        });
      } else if (m.funded && !m.claimed) {
        allEvents.push({
          text: `Capital allocated: ${m.name} (${p.name})`,
          time: '',
          timestamp: 0,
          icon: Activity,
          dotBg: 'bg-primary/20',
          dotColor: 'text-primary',
        });
      }
    }
  }

  allEvents.sort((a, b) => b.timestamp - a.timestamp);
  return allEvents.slice(0, 12);
}

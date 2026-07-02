import React from 'react';
import { Project, Contractor, ServiceStatus } from '../../types';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { HealthBadge } from '../ui/HealthBadge';
import { MetricCard } from '../ui/MetricCard';
import { Activity, Database, Landmark, TrendingUp, Users, ScrollText, Server, ShieldAlert, BarChart3, HardDrive } from 'lucide-react';

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

const SERVICE_ICONS: Record<string, React.ElementType> = {
  'API Gateway': Server,
  'Ledger': ScrollText,
  'Settlement': Landmark,
  'Risk Engine': ShieldAlert,
  'Forecast': TrendingUp,
  'Storage': HardDrive,
};

function deriveServices(projects: Project[], contractors: Contractor[], ledgerEntryCount: number, latency: Props['apiLatencyMs']): ServiceStatus[] {
  const hasActiveProjects = projects.some(p => p.status !== 'completed');
  const hasPendingSettlements = projects.some(p => p.milestones.some(m => m.claimed && !m.settled));
  const hasRiskData = hasActiveProjects;

  const services: ServiceStatus[] = [
    {
      name: 'API Gateway',
      status: latency.economy < 500 ? 'Healthy' : latency.economy < 2000 ? 'Warning' : 'Offline',
      latency: `${latency.economy}ms`,
    },
    {
      name: 'Ledger',
      status: ledgerEntryCount > 0 ? 'Healthy' : 'Warning',
      latency: ledgerEntryCount > 0 ? `${latency.projects}ms` : 'N/A',
    },
    {
      name: 'Settlement',
      status: hasPendingSettlements ? 'Syncing' : projects.some(p => p.status === 'completed') ? 'Healthy' : 'Healthy',
      latency: hasPendingSettlements ? 'Pending' : 'N/A',
    },
    {
      name: 'Risk Engine',
      status: hasRiskData ? 'Healthy' : 'Warning',
      latency: `${latency.risk}ms`,
    },
    {
      name: 'Forecast',
      status: hasActiveProjects ? 'Healthy' : 'Warning',
      latency: `${latency.forecast}ms`,
    },
    {
      name: 'Storage',
      status: projects.length > 0 && contractors.length > 0 ? 'Healthy' : 'Warning',
      latency: `${latency.contractors}ms`,
    },
  ];

  return services;
}

export const ServiceStatusGrid: React.FC<Props> = ({ projects, contractors, ledgerEntryCount, apiLatencyMs }) => {
  const services = deriveServices(projects, contractors, ledgerEntryCount, apiLatencyMs);
  const timelineEvents = buildTimeline(projects);

  const healthyCount = services.filter(s => s.status === 'Healthy').length;
  const warningCount = services.filter(s => s.status === 'Warning' || s.status === 'Syncing').length;

  return (
    <div className="space-y-6">
      {/* Service Status Grid */}
      <Panel>
        <SectionHeader
          title="Engine Services"
          action={
            <div className="flex items-center gap-4 text-caption">
              <span className="flex items-center gap-2 text-success"><div className="w-2 h-2 rounded-full bg-success" />{healthyCount} Healthy</span>
              {warningCount > 0 && (
                <span className="flex items-center gap-2 text-warning"><div className="w-2 h-2 rounded-full bg-warning" />{warningCount} Attention</span>
              )}
            </div>
          }
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {services.map(s => {
            const Icon = SERVICE_ICONS[s.name] || Server;
            return (
              <div
                key={s.name}
                className="flex items-center justify-between p-4 bg-elevated rounded-12 border border-border-main"
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className="text-text-dim" />
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

      {/* Storage Metrics */}
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

      {/* Engine Activity Timeline */}
      <Panel>
        <SectionHeader title="Engine Activity" />
        {timelineEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity size={32} className="text-text-dim mb-3" />
            <p className="text-small text-text-muted">No recent engine activity.</p>
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

  // Collect all milestone events with timestamps and sort by recency
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

  // Sort by timestamp descending (most recent first)
  allEvents.sort((a, b) => b.timestamp - a.timestamp);
  return allEvents.slice(0, 12);
}
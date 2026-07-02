import React, { useMemo } from 'react';
import { ForecastData, Project, Economy } from '../../../types';
import { money } from '../../../lib/api';
import { Panel } from '../../ui/Panel';
import { SectionHeader } from '../../ui/SectionHeader';
import { CircularGauge } from '../../ui/CircularGauge';
import { CashFlowChart } from '../CashFlowChart';
import { ProjectForecastCards } from '../ProjectForecastCards';
import { EmptyState } from '../../ui/EmptyState';
import { Skeleton, CardSkeleton } from '../../ui/Skeleton';
import { TrendingUp, Calendar, Landmark, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

interface ForecastsPageProps {
  forecast: ForecastData | null;
  projects: Project[];
  economy: Economy | null;
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const FORECAST_POINTS = [
  { targetDay: 0, label: 'Today' },
  { targetDay: 7, label: '7 Days' },
  { targetDay: 30, label: '30 Days' },
  { targetDay: 90, label: 'Quarter' },
];

export const ForecastsPage: React.FC<ForecastsPageProps> = ({ forecast, projects, economy, isLoading, error, onRetry }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-surface rounded-card border border-border-main p-6 h-28 animate-pulse" />
          ))}
        </div>
        <div className="bg-surface rounded-card border border-border-main p-6 h-64 animate-pulse" />
        <div className="bg-surface rounded-card border border-border-main p-6 h-48 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <Panel>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle size={32} className="text-warning mb-4" />
          <h4 className="text-body-lg font-semibold text-text-main mb-2">Forecast Unavailable</h4>
          <p className="text-small text-text-muted mb-6">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-12 font-semibold hover:bg-primary-hover transition-colors text-small"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          )}
        </div>
      </Panel>
    );
  }

  if (!forecast) {
    return (
      <Panel>
        <EmptyState
          icon={TrendingUp}
          title="Forecast Unavailable"
          description="No predictive data yet. Ensure the CFEL engine has active projects."
        />
      </Panel>
    );
  }

  // Build chart data from backend arrays
  const chartData = forecast.cash.days.map((day, i) => ({
    day,
    available: forecast.cash.available[i],
    locked: forecast.cash.locked[i],
    settled: forecast.cash.settled[i],
  }));

  // Derive settlement confidence from data — ratio of settled milestones to total milestones
  // No financial calculation: counting milestones, not money
  const totalMilestones = projects.reduce((sum, p) => sum + p.milestones.length, 0);
  const settledMilestones = projects.reduce((sum, p) => sum + p.milestones.filter(m => m.settled).length, 0);
  const settlementConfidence = totalMilestones > 0 ? Math.round((settledMilestones / totalMilestones) * 100) : 0;

  // Find settlement entries for the events list
  const futureEvents = buildFutureEvents(projects);

  // Project name lookup for settlement byProject display
  const projectMap = useMemo(() => {
    const m: Record<string, string> = {};
    projects.forEach(p => { m[p.id] = p.name; });
    return m;
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Forecast KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {FORECAST_POINTS.map(({ targetDay, label }) => {
          const idx = forecast.cash.days.indexOf(targetDay);
          if (idx === -1) return null;
          return (
            <div key={targetDay} className="bg-surface rounded-card border border-border-main p-6 shadow-soft  transition-transform duration-fast">
              <p className="text-text-dim text-caption uppercase tracking-wide mb-2">{label}</p>
              <p className="text-title font-bold text-success">{money(forecast.cash.available[idx])}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-caption text-text-dim">Locked:</span>
                <span className="text-caption font-semibold text-warning">{money(forecast.cash.locked[idx])}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cash Flow Projection */}
      <Panel>
        <SectionHeader title="Cash Flow Projection" />
        <CashFlowChart data={chartData} totalCapital={economy?.totalCapital || '0'} />
        <div className="flex justify-center gap-8 mt-8 text-caption text-text-dim">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary/50 rounded-6" />
            Available
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-warning/50 rounded-6" />
            Locked
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success/50 rounded-6" />
            Settled
          </div>
        </div>
      </Panel>

      {/* Milestone Completion Forecast */}
      <ProjectForecastCards projects={projects} />

      {/* Settlement Forecast + Future Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settlement Forecast */}
        <Panel className="lg:lg:col-span-8 col-span-12">
          <SectionHeader title="Settlement Forecast" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-elevated rounded-card p-6 text-center">
              <p className="text-text-dim text-caption uppercase tracking-wide mb-2">Expected Total Settled</p>
              <p className="text-h1 font-bold text-success leading-none">{money(forecast.settlement.totalSettled)}</p>
              <p className="text-caption text-text-dim mt-2">{settledMilestones} of {totalMilestones} milestones settled</p>
            </div>
            <div className="bg-elevated rounded-card p-6 text-center">
              <p className="text-text-dim text-caption uppercase tracking-wide mb-2">Settlement Confidence</p>
              <div className="flex justify-center mt-2">
                <CircularGauge value={settlementConfidence} size={80} stroke={6} />
              </div>
            </div>
          </div>

          {/* Per-project settlement breakdown — use project names */}
          {Object.entries(forecast.settlement.byProject).length > 0 && (
            <div className="mt-6 space-y-2">
              <h4 className="text-small font-semibold text-text-main">Settled by Project</h4>
              {Object.entries(forecast.settlement.byProject).map(([id, amount]) => (
                <div key={id} className="flex justify-between items-center p-3 bg-elevated rounded-8">
                  <span className="text-small text-text-muted">{projectMap[id] || id.substring(0, 8) + '...'}</span>
                  <span className="text-small font-semibold text-success">{money(amount)}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Future Events */}
        <Panel className="lg:lg:col-span-4 col-span-12">
          <SectionHeader title="Upcoming Events" />
          {futureEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar size={32} className="text-text-dim mb-3" />
              <p className="text-small text-text-muted">No upcoming events.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {futureEvents.map((evt, i) => (
                <div key={i} className="p-3 bg-elevated rounded-8 border-l-2 border-border-main hover:border-primary transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <evt.icon size={16} className={evt.color} />
                    <span className="text-caption font-bold uppercase text-text-dim">{evt.type}</span>
                  </div>
                  <p className="text-small font-medium text-text-main">{evt.text}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
};

/* ---- Pure event extraction from project state. No calculations. ---- */

interface FutureEvent {
  type: string;
  text: string;
  icon: React.ElementType;
  color: string;
}

function buildFutureEvents(projects: Project[]): FutureEvent[] {
  const events: FutureEvent[] = [];

  for (const p of projects) {
    if (p.status === 'completed') continue;

    for (const m of p.milestones) {
      if (m.claimed && !m.settled) {
        events.push({ type: 'Settlement', text: `${m.name} — ${p.name}`, icon: Landmark, color: 'text-success' });
      } else if (m.funded && !m.claimed) {
        events.push({ type: 'Claim', text: `${m.name} — ${p.name}`, icon: Clock, color: 'text-warning' });
      } else if (!m.funded) {
        events.push({ type: 'Funding', text: `${m.name} — ${p.name}`, icon: TrendingUp, color: 'text-primary' });
      }
    }
  }

  return events.slice(0, 12);
}
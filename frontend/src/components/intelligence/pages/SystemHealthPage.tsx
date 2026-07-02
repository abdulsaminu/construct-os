import React from 'react';
import { Project, Contractor, Economy } from '../../../types';
import { Panel } from '../../ui/Panel';
import { SectionHeader } from '../../ui/SectionHeader';
import { MetricCard } from '../../ui/MetricCard';
import { ServiceStatusGrid } from '../ServiceStatusGrid';
import { AlertTriangle, RefreshCw, Activity, Database, Users } from 'lucide-react';

interface SystemHealthPageProps {
  projects: Project[];
  contractors: Contractor[];
  economy: Economy | null;
  ledgerEntryCount: number;
  apiLatencyMs: {
    economy: number;
    projects: number;
    risk: number;
    allocations: number;
    forecast: number;
    contractors: number;
  };
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const SystemHealthPage: React.FC<SystemHealthPageProps> = ({
  projects, contractors, economy, ledgerEntryCount, apiLatencyMs, isLoading, error, onRetry
}) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface rounded-card border border-border-main p-6 h-36 animate-pulse" />
          ))}
        </div>
        <div className="bg-surface rounded-card border border-border-main p-6 h-64 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <Panel>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle size={32} className="text-warning mb-4" />
          <h4 className="text-body-lg font-semibold text-text-main mb-2">System Health Unavailable</h4>
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

  return (
    <div className="space-y-6">
      {/* Core Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard
          title="Ledger Entries"
          value={String(ledgerEntryCount)}
          footer="Immutable records"
          icon={Activity}
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
        <MetricCard
          title="API Latency"
          value={`${apiLatencyMs.economy}ms`}
          footer="Root endpoint response"
          icon={Activity}
          color="text-success"
        />
      </div>

      {/* Service Grid + Activity Timeline */}
      <ServiceStatusGrid
        projects={projects}
        contractors={contractors}
        ledgerEntryCount={ledgerEntryCount}
        apiLatencyMs={apiLatencyMs}
      />
    </div>
  );
};
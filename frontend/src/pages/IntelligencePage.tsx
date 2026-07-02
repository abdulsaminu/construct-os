import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetcher } from '../lib/api';
import {
  Economy, Project, Contractor, RiskScore,
  AllocationRecommendation, ForecastData, LedgerEntry
} from '../types';
import { OverviewPage } from '../components/intelligence/pages/OverviewPage';
import { RiskEnginePage } from '../components/intelligence/pages/RiskEnginePage';
import { AllocationPage } from '../components/intelligence/pages/AllocationPage';
import { ForecastsPage } from '../components/intelligence/pages/ForecastsPage';
import { SystemHealthPage } from '../components/intelligence/pages/SystemHealthPage';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'risk', label: 'Risk Engine' },
  { id: 'allocation', label: 'Capital Allocation' },
  { id: 'forecasts', label: 'Forecasts' },
  { id: 'health', label: 'System Health' },
];

interface ApiLatency {
  economy: number;
  projects: number;
  risk: number;
  allocations: number;
  forecast: number;
  contractors: number;
}

const DEFAULT_LATENCY: ApiLatency = { economy: 0, projects: 0, risk: 0, allocations: 0, forecast: 0, contractors: 0 };

interface Props {
  defaultTab?: string;
}

export const IntelligencePage: React.FC<Props> = ({ defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || 'overview');
  const [economy, setEconomy] = useState<Economy | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [risks, setRisks] = useState<Record<string, RiskScore>>({});
  const [allocations, setAllocations] = useState<AllocationRecommendation[]>([]);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [ledgerEntryCount, setLedgerEntryCount] = useState(0);
  const [apiLatencyMs, setApiLatencyMs] = useState<ApiLatency>(DEFAULT_LATENCY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync tab when defaultTab changes from parent
  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Measure latency for each API call
      const timed = async <T,>(url: string): Promise<{ data: T; ms: number }> => {
        const start = performance.now();
        const data = await fetcher<T>(url);
        const ms = Math.round(performance.now() - start);
        return { data, ms };
      };

      // Parallel fetch of all 6 primary data sources
      const [e, p, c, r, a, f] = await Promise.all([
        timed<Economy>('/economy'),
        timed<Project[]>('/projects'),
        timed<Contractor[]>('/contractors'),
        timed<Record<string, RiskScore>>('/system/risk'),
        timed<AllocationRecommendation[]>('/system/allocations'),
        timed<ForecastData>('/system/forecast?horizonDays=90'),
      ]);

      setEconomy(e.data);
      setProjects(p.data);
      setContractors(c.data);
      setRisks(r.data);
      setAllocations(a.data);
      setForecast(f.data);

      // Store latency measurements
      setApiLatencyMs({
        economy: e.ms,
        projects: p.ms,
        risk: r.ms,
        allocations: a.ms,
        forecast: f.ms,
        contractors: c.ms,
      });

      // Fetch per-project ledger entries in parallel
      const ledgerPromises = p.data.map(async (proj) => {
        try {
          const entries = await fetcher<LedgerEntry[]>(`/projects/${proj.id}/ledger`);
          return entries;
        } catch {
          return [];
        }
      });
      const allLedgerResults = await Promise.all(ledgerPromises);
      const allEntries = allLedgerResults.flat();
      setLedgerEntries(allEntries);
      setLedgerEntryCount(allEntries.length);
    } catch (err) {
      console.error(err);
      setError('Unable to load intelligence data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Project ID → Name mapping (no calculations)
  const projectMap = useMemo(() => {
    const m: Record<string, string> = {};
    projects.forEach(p => { m[p.id] = p.name; });
    return m;
  }, [projects]);

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewPage
            economy={economy}
            projects={projects}
            allocations={allocations}
            risks={risks}
            contractors={contractors}
            ledgerEntries={ledgerEntries}
            isLoading={isLoading}
            error={error}
            onRetry={loadData}
          />
        );
      case 'risk':
        return (
          <RiskEnginePage
            risks={risks}
            projectMap={projectMap}
            projects={projects}
            isLoading={isLoading}
            error={error}
            onRetry={loadData}
          />
        );
      case 'allocation':
        return (
          <AllocationPage
            allocations={allocations}
            economy={economy}
            isLoading={isLoading}
            error={error}
            onRetry={loadData}
          />
        );
      case 'forecasts':
        return (
          <ForecastsPage
            forecast={forecast}
            projects={projects}
            economy={economy}
            isLoading={isLoading}
            error={error}
            onRetry={loadData}
          />
        );
      case 'health':
        return (
          <SystemHealthPage
            projects={projects}
            contractors={contractors}
            economy={economy}
            ledgerEntryCount={ledgerEntryCount}
            apiLatencyMs={apiLatencyMs}
            isLoading={isLoading}
            error={error}
            onRetry={loadData}
          />
        );
      default:
        return null;
    }
  };

  // Error state with retry
  if (error && !isLoading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="flex items-center gap-2 border-b border-border-main mb-8 pb-4 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-t-xl text-small font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-elevated text-primary border border-b-2 border-primary mb-[-2px]'
                  : 'text-text-muted hover:text-text-main hover:bg-elevated'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-surface rounded-card border border-border-main p-12 text-center">
          <AlertTriangle size={32} className="mx-auto text-warning mb-4" />
          <h3 className="text-h3 font-semibold text-text-main mb-2">{error}</h3>
          <p className="text-text-muted mb-6">Check that the backend is running on port 3001.</p>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-12 font-semibold hover:bg-primary-hover transition-colors"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Sub-Navigation */}
      <div className="flex items-center gap-2 border-b border-border-main mb-8 pb-4 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-t-xl text-small font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-elevated text-primary border border-b-2 border-primary mb-[-2px]'
                : 'text-text-muted hover:text-text-main hover:bg-elevated'
            }`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderTab()}
    </div>
  );
};
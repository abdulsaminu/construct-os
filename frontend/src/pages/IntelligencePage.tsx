import React, { useState, useEffect } from 'react';
import { fetcher } from '../lib/api';
import { Economy, Project, RiskScore, AllocationRecommendation } from '../types';
import { OverviewPage } from '../components/intelligence/pages/OverviewPage';
import { RiskEnginePage } from '../components/intelligence/pages/RiskEnginePage';
import { AllocationPage } from '../components/intelligence/pages/AllocationPage';
import { ForecastsPage } from '../components/intelligence/pages/ForecastsPage';
import { SystemHealthPage } from '../components/intelligence/pages/SystemHealthPage';

interface ForecastData {
  cash: { days: number[]; available: string[]; locked: string[]; settled: string[] };
  settlement: { totalSettled: string; byProject: Record<string, string> };
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'risk', label: 'Risk Engine' },
  { id: 'allocation', label: 'Capital Allocation' },
  { id: 'forecasts', label: 'Forecasts' },
  { id: 'health', label: 'System Health' },
];

export const IntelligencePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [economy, setEconomy] = useState<Economy | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [risks, setRisks] = useState<Record<string, RiskScore>>({});
  const [allocations, setAllocations] = useState<AllocationRecommendation[]>([]);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [e, p, r, a, f] = await Promise.all([
          fetcher<Economy>('/economy'),
          fetcher<Project[]>('/projects'),
          fetcher<Record<string, RiskScore>>('/system/risk'),
          fetcher<AllocationRecommendation[]>('/system/allocations'),
          fetcher<ForecastData>('/system/forecast?horizonDays=90')
        ]);
        setEconomy(e); setProjects(p); setRisks(r); setAllocations(a); setForecast(f);
      } catch (err) { console.error(err); } 
      finally { setIsLoading(false); }
    };
    loadData();
  }, []);

  // Map Project IDs to Names (No math)
  const projectMap: Record<string, string> = {};
  projects.forEach(p => { projectMap[p.id] = p.name; });

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewPage economy={economy} projects={projects} allocations={allocations} isLoading={isLoading} />;
      case 'risk': return <RiskEnginePage risks={risks} projectMap={projectMap} isLoading={isLoading} />;
      case 'allocation': return <AllocationPage allocations={allocations} isLoading={isLoading} />;
      case 'forecasts': return <ForecastsPage forecast={forecast} isLoading={isLoading} />;
      case 'health': return <SystemHealthPage projects={projects} />;
      default: return null;
    }
  };

  return (
    <div className="p-8">
      {/* Sub-Navigation */}
      <div className="flex items-center gap-2 border-b border-border-main mb-8 pb-4 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 rounded-t-xl text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-elevated text-primary border border-b-2 border-primary mb-[-2px]' : 'text-text-muted hover:text-text-main hover:bg-elevated'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderTab()}
    </div>
  );
};

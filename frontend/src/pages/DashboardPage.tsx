import { useEffect, useState } from 'react';
import { fetcher } from '../lib/api';
import { Economy, Project, RiskScore, AllocationRecommendation, LedgerEntry } from '../types';
import { DashboardKPIs } from '../components/dashboard/DashboardKPIs';
import { PortfolioPanel } from '../components/dashboard/PortfolioPanel';
import { TreasuryFlow } from '../components/dashboard/TreasuryFlow';
import { CommandCenter } from '../components/dashboard/CommandCenter';
import { RiskMonitor } from '../components/dashboard/RiskMonitor';
import { RecentLedger } from '../components/dashboard/RecentLedger';
import { UpcomingActions } from '../components/dashboard/UpcomingActions';

interface Props {
  onSelectProject: (id: string) => void;
}

export const DashboardPage: React.FC<Props> = ({ onSelectProject }) => {
  const [economy, setEconomy] = useState<Economy | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [risks, setRisks] = useState<Record<string, RiskScore>>({});
  const [allocations, setAllocations] = useState<AllocationRecommendation[]>([]);
  const [ledger, setLedger] = useState<(LedgerEntry & { projectName?: string })[]>([]);

  useEffect(() => {
    // Independent fetches respecting event sourcing
    fetcher<Economy>('/economy').then(setEconomy);
    
    fetcher<Project[]>('/projects').then(async (projs) => {
      setProjects(projs);
      
      // Fetch individual project ledgers for recent events display
      const ledgerPromises = projs.slice(0, 5).map(async (p) => {
        try {
          const entries = await fetcher<LedgerEntry[]>(`/projects/${p.id}/ledger`);
          return entries.map(e => ({ ...e, projectName: p.name }));
        } catch {
          return [];
        }
      });

      const allEntries = await Promise.all(ledgerPromises);
      // Sort by timestamp descending and take top 10
      setLedger(allEntries.flat().sort((a, b) => b.timestamp - a.timestamp).slice(0, 10));
    });

    fetcher<Record<string, RiskScore>>('/system/risk').then(setRisks);
    fetcher<AllocationRecommendation[]>('/system/allocations').then(setAllocations);
  }, []);

  return (
 <div className="space-y-6">
      <DashboardKPIs economy={economy} />

 <div className="grid grid-cols-12 gap-6">
        <PortfolioPanel projects={projects} risks={risks} onSelectProject={onSelectProject} />
        <TreasuryFlow economy={economy} />
      </div>

 <div className="grid grid-cols-12 gap-6">
        <CommandCenter projects={projects} onSelectProject={onSelectProject} />
        <RiskMonitor risks={risks} allocations={allocations} projects={projects} />
      </div>

 <div className="grid grid-cols-12 gap-6">
        <RecentLedger entries={ledger} />
        <UpcomingActions projects={projects} onSelectProject={onSelectProject} />
      </div>
    </div>
  );
};

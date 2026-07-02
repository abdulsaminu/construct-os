import React, { useState, useEffect, useCallback } from 'react';
import { Economy, Project, LedgerEntry } from '../types';
import { fetcher } from '../lib/api';
import { TreasuryHeader } from '../components/treasury/TreasuryHeader';
import { TreasuryKPIs } from '../components/treasury/TreasuryKPIs';
import { CapitalDistribution } from '../components/treasury/CapitalDistribution';
import { DepositCard } from '../components/treasury/DepositCard';
import { TreasuryTimeline } from '../components/treasury/TreasuryTimeline';
import { QuickActions } from '../components/treasury/QuickActions';
import { TreasuryHealth } from '../components/treasury/TreasuryHealth';
import { CapitalEventsTable } from '../components/treasury/CapitalEventsTable';
import { ActivityFeed } from '../components/treasury/ActivityFeed';

interface Props {
  onNavigate: (id: string) => void;
}

export const TreasuryPage: React.FC<Props> = ({ onNavigate }) => {
  const [economy, setEconomy] = useState<Economy | null>(null);
  const [ledger, setLedger] = useState<(LedgerEntry & { projectName?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ecoData, projData] = await Promise.all([
        fetcher<Economy>('/economy'),
        fetcher<Project[]>('/projects')
      ]);

      setEconomy(ecoData);

      // Build ledger from all projects for timeline/events
      const allEntries = await Promise.all(
        projData.map(async (p) => {
          try {
            const entries = await fetcher<LedgerEntry[]>(`/projects/${p.id}/ledger`);
            return entries.map(e => ({ ...e, projectName: p.name }));
          } catch { return []; }
        })
      );
      
      // Sort by timestamp descending
      setLedger(allEntries.flat().sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      console.error("Treasury unavailable", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="p-8">
      <TreasuryHeader onRefresh={loadData} isLoading={isLoading} />

      <div className="space-y-6">
        {/* Row 1: KPIs */}
        <TreasuryKPIs economy={economy} isLoading={isLoading} />

        {/* Row 2: Distribution & Deposit */}
        <div className="grid grid-cols-12 gap-6">
          <CapitalDistribution economy={economy} isLoading={isLoading} />
          <DepositCard onDepositSuccess={loadData} />
        </div>

        {/* Row 3: Timeline & Quick Actions */}
        <div className="grid grid-cols-12 gap-6">
          <TreasuryTimeline entries={ledger} isLoading={isLoading} />
          <QuickActions onNavigate={onNavigate} />
        </div>

        {/* Row 4: Health & Recent Events */}
        <div className="grid grid-cols-12 gap-6">
          <TreasuryHealth />
          <CapitalEventsTable entries={ledger} isLoading={isLoading} />
        </div>

        {/* Row 5: Activity Feed */}
        <ActivityFeed entries={ledger} isLoading={isLoading} />
      </div>
    </div>
  );
};

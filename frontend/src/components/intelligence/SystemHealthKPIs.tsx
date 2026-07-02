import React from 'react';
import { Economy } from '../../types';
import { MetricCard } from '../ui/MetricCard';
import { money } from '../../lib/api';
import { Landmark, TrendingUp, Lock, CheckCircle } from 'lucide-react';

interface Props {
  economy: Economy | null;
  isLoading: boolean;
}

export const SystemHealthKPIs: React.FC<Props> = ({ economy, isLoading }) => {
  if (isLoading || !economy) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="bg-surface rounded-2xl border border-border-main p-6 animate-pulse h-32" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <MetricCard title="Total System Capital" value={money(economy.totalCapital)} footer="Current Pool Size" icon={Landmark} color="text-primary" />
      <MetricCard title="Deployable Liquidity" value={money(economy.availableCapital)} footer="Available for Funding" icon={TrendingUp} color="text-success" />
      <MetricCard title="Active Exposure" value={money(economy.lockedCapital)} footer="Capital in Escrow" icon={Lock} color="text-warning" />
      <MetricCard title="Settlement Velocity" value={money(economy.settledCapital)} footer="Blockchain Confirmed" icon={CheckCircle} color="text-success" />
    </div>
  );
};

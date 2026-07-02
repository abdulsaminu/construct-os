import React from 'react';
import { Economy } from '../../types';
import { MetricCard } from '../ui/MetricCard';
import { money } from '../../lib/api';
import { Wallet, TrendingUp, Lock, CheckCircle } from 'lucide-react';

interface Props {
  economy: Economy | null;
}

export const DashboardKPIs: React.FC<Props> = ({ economy }) => {
  if (!economy) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <MetricCard title="Total Capital" value={money(economy.totalCapital)} footer="Capital deposited" icon={Wallet} color="text-primary" />
      <MetricCard title="Available Liquidity" value={money(economy.availableCapital)} footer="Available for funding" icon={TrendingUp} color="text-success" />
      <MetricCard title="Locked Escrow" value={money(economy.lockedCapital)} footer="Awaiting completion" icon={Lock} color="text-warning" />
      <MetricCard title="Settled On-Chain" value={money(economy.settledCapital)} footer="Blockchain confirmed" icon={CheckCircle} color="text-success" />
    </div>
  );
};

import React from 'react';
import { Economy } from '../../types';
import { MetricCard } from '../ui/MetricCard';
import { money } from '../../lib/api';
import { Wallet, TrendingUp, Lock, CheckCircle } from 'lucide-react';
import { CardSkeleton } from '../ui/Skeleton';

interface Props {
  economy: Economy | null;
  isLoading: boolean;
}

export const TreasuryKPIs: React.FC<Props> = ({ economy, isLoading }) => {
 if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>;
  if (!economy) return null;

  return (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <MetricCard title="Total Capital" value={money(economy.totalCapital)} footer="Capital deposited into treasury" icon={Wallet} color="text-primary" />
      <MetricCard title="Available Liquidity" value={money(economy.availableCapital)} footer="Available for project funding" icon={TrendingUp} color="text-success" />
      <MetricCard title="Capital in Escrow" value={money(economy.lockedCapital)} footer="Allocated to funded milestones" icon={Lock} color="text-warning" />
      <MetricCard title="Settled Capital" value={money(economy.settledCapital)} footer="Confirmed on blockchain" icon={CheckCircle} color="text-success" />
    </div>
  );
};

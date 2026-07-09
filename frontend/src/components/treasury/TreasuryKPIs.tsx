import React from 'react';
import { Economy } from '../../types';
import { MetricCard } from '../ui/MetricCard';
import { money } from '../../lib/api';
import { Wallet, TrendingUp, Lock, CheckCircle } from 'lucide-react';
import { CardSkeleton } from '../ui/Skeleton';
import { useAccount } from 'wagmi';
import { useUsdcBalance, TREASURY_ADDRESS } from '../../lib/web3';
import { useWalletMode } from '../../lib/walletMode';

interface Props {
  economy: Economy | null;
  isLoading: boolean;
}

export const TreasuryKPIs: React.FC<Props> = ({ economy, isLoading }) => {
  const { address, isConnected } = useAccount();
  const { mode } = useWalletMode();
  const displayAddress = mode === 'user' && isConnected ? address : TREASURY_ADDRESS;
  const { formatted: liveBalance } = useUsdcBalance(displayAddress);

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>;
  if (!economy) return null;

  return (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <MetricCard
        title="Wallet Balance"
        value={liveBalance !== undefined ? `$${liveBalance}` : '...'}
        footer={mode === 'user' && isConnected ? 'Your connected wallet (on-chain)' : 'ConstructOS Treasury (on-chain)'}
        icon={Wallet}
        color="text-primary"
      />
      <MetricCard title="Available Liquidity" value={money(economy.availableCapital)} footer="Available for project funding" icon={TrendingUp} color="text-success" />
      <MetricCard title="Capital in Escrow" value={money(economy.lockedCapital)} footer="Allocated to funded milestones" icon={Lock} color="text-warning" />
      <MetricCard title="Settled Capital" value={money(economy.settledCapital)} footer="Confirmed on blockchain" icon={CheckCircle} color="text-success" />
    </div>
  );
};

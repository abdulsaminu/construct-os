import { Economy } from '../../types';
import { MetricCard } from '../ui/MetricCard';
import { money } from '../../lib/api';
import { Wallet, TrendingUp, Lock, CheckCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useUsdcBalance, TREASURY_ADDRESS } from '../../lib/web3';
import { useWalletMode } from '../../lib/walletMode';

interface Props {
  economy: Economy | null;
}

export const DashboardKPIs: React.FC<Props> = ({ economy }) => {
  const { address, isConnected } = useAccount();
  const { mode } = useWalletMode();
  const displayAddress = mode === 'user' && isConnected ? address : TREASURY_ADDRESS;
  const { formatted: liveBalance } = useUsdcBalance(displayAddress);

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
      <MetricCard title="Available Liquidity" value={money(economy.availableCapital)} footer="Available for funding" icon={TrendingUp} color="text-success" />
      <MetricCard title="Locked Escrow" value={money(economy.lockedCapital)} footer={Number(economy.lockedCapital) > 0 ? "Funds locked in milestones" : "No active escrows"} icon={Lock} color="text-warning" />
      <MetricCard title="Settled On-Chain" value={money(economy.settledCapital)} footer="Blockchain confirmed" icon={CheckCircle} color="text-success" />
    </div>
  );
};

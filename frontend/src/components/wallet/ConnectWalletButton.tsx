import React, { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { Wallet, LogOut, RefreshCw, Circle } from 'lucide-react';
import { useWalletMode } from '../../lib/walletMode';
import { useUsdcBalance } from '../../lib/web3';
import { ConnectWalletModal } from './ConnectWalletModal';

export const ConnectWalletButton: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { mode, setMode } = useWalletMode();
  const { formatted: usdcBalance } = useUsdcBalance();

  const handleDisconnect = () => {
    disconnect();
    setMode('demo');
  };

  if (mode === 'user' && isConnected && address) {
    return (
      <>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end leading-tight">
            <span className="text-small font-mono text-text-main" title={address}>
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <span className="text-caption text-text-dim">
              {usdcBalance ?? '...'} USDC · Arc Testnet
            </span>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="p-2 text-text-muted hover:text-text-main transition-colors"
            aria-label="Switch wallet"
            title="Switch wallet"
          >
            <RefreshCw size={16} aria-hidden="true" />
          </button>
          <button
            onClick={handleDisconnect}
            className="p-2 text-text-muted hover:text-danger transition-colors"
            aria-label="Disconnect wallet"
            title="Disconnect"
          >
            <LogOut size={16} aria-hidden="true" />
          </button>
        </div>
        <ConnectWalletModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 bg-elevated border border-border-main rounded-btn px-4 py-2 text-small font-semibold hover:border-primary transition-colors"
        aria-label="Connect wallet or use demo mode"
      >
        {mode === 'demo'
          ? <Circle size={10} className="text-primary shrink-0" aria-hidden="true" fill="currentColor" />
          : <Wallet size={16} aria-hidden="true" />}
        {mode === 'demo' ? 'Demo Treasury Mode' : 'Connect Wallet'}
      </button>
      <ConnectWalletModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

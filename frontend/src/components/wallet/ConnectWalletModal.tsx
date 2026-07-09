import React from 'react';
import { useConnect } from 'wagmi';
import { X, Wallet, ScanLine, LayoutDashboard } from 'lucide-react';
import { useWalletMode } from '../../lib/walletMode';
import { isWalletConnectEnabled } from '../../lib/web3';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ConnectWalletModal: React.FC<Props> = ({ open, onClose }) => {
  const { connect, connectors } = useConnect();
  const { setMode } = useWalletMode();

  if (!open) return null;

  const injectedConnector = connectors.find(c => c.type === 'injected');
  const walletConnectConnector = connectors.find(c => c.id === 'walletConnect');

  const handleConnect = (connector: (typeof connectors)[number]) => {
    setMode('user');
    connect({ connector });
    onClose();
  };

  const handleDemoMode = () => {
    setMode('demo');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Connect wallet"
    >
      <div
        className="bg-surface border border-border-main rounded-card w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-page-title font-bold text-text-main">Connect Wallet</h3>
          <button onClick={onClose} aria-label="Close" className="text-text-muted hover:text-text-main transition-colors">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-3">
          {injectedConnector && (
            <button
              onClick={() => handleConnect(injectedConnector)}
              className="w-full flex items-center gap-3 bg-elevated border border-border-main rounded-btn px-4 py-3 hover:border-primary transition-colors text-left"
            >
              <Wallet size={20} aria-hidden="true" />
              <span className="font-semibold text-text-main">MetaMask / Browser Wallet</span>
            </button>
          )}

          {isWalletConnectEnabled && walletConnectConnector ? (
            <button
              onClick={() => handleConnect(walletConnectConnector)}
              className="w-full flex items-center gap-3 bg-elevated border border-border-main rounded-btn px-4 py-3 hover:border-primary transition-colors text-left"
            >
              <ScanLine size={20} aria-hidden="true" />
              <span className="font-semibold text-text-main">WalletConnect</span>
            </button>
          ) : (
            <div
              className="w-full flex items-center gap-3 bg-elevated/50 border border-border-main rounded-btn px-4 py-3 opacity-50 cursor-not-allowed"
              title="Set VITE_WALLETCONNECT_PROJECT_ID in frontend/.env to enable"
            >
              <ScanLine size={20} aria-hidden="true" />
              <span className="font-semibold text-text-main">WalletConnect (not configured)</span>
            </div>
          )}

          <div
            className="w-full flex items-center gap-3 bg-elevated/50 border border-border-main rounded-btn px-4 py-3 opacity-50 cursor-not-allowed"
            title="Circle Wallets integration pending — see docs/CIRCLE_WALLETS.md"
          >
            <Wallet size={20} aria-hidden="true" />
            <span className="font-semibold text-text-main">Circle Wallet (coming soon)</span>
          </div>

          <button
            onClick={handleDemoMode}
            className="w-full flex items-center gap-3 bg-primary/10 border border-primary rounded-btn px-4 py-3 hover:bg-primary/20 transition-colors text-left"
          >
            <LayoutDashboard size={20} aria-hidden="true" />
            <span className="font-semibold text-primary">Continue in Demo Treasury Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
};

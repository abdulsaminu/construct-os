import React, { useState } from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface Props {
  onRefresh: () => void;
  isLoading: boolean;
}

export const TreasuryHeader: React.FC<Props> = ({ onRefresh, isLoading }) => {
  const [lastSync, setLastSync] = useState(new Date());

  const handleRefresh = () => {
    onRefresh();
    setLastSync(new Date());
  };

  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-display font-bold text-text-main leading-none">Treasury</h1>
        <p className="text-body text-text-muted mt-2">Capital pool management and treasury operations</p>
      </div>
      <div className="flex items-center gap-4 pt-2">
        <div className="text-right hidden sm:block">
          <p className="text-caption text-text-dim">Last Sync</p>
          <p className="text-caption text-text-muted font-mono">{lastSync.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-success/10 border border-success/20 rounded-full">
          <Wifi size={16} className="text-success" />
          <span className="text-caption font-semibold text-success">Connected</span>
        </div>
        <button 
          onClick={handleRefresh} 
          disabled={isLoading}
          className="p-2 rounded-12 bg-elevated border border-border-main hover:bg-white/5 transition-colors duration-fast disabled:opacity-50"
          aria-label="Refresh data"
        >
          <RefreshCw size={20} className={`text-text-muted ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};

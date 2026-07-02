import React from 'react';
import { LedgerEntry } from '../../types';
import { money } from '../../lib/api';
import { CopyButton } from '../ui/CopyButton';
import { ArrowDownCircle } from 'lucide-react';

interface Props {
  entries: LedgerEntry[];
  onSelect: (e: LedgerEntry) => void;
}

export const LedgerTimeline: React.FC<Props> = ({ entries, onSelect }) => {
  const getLineColor = (type: string) => {
    switch(type) {
      case 'CAPITAL_DEPOSIT': return 'border-primary';
      case 'MILESTONE_FUNDED': return 'border-warning';
      case 'MILESTONE_CLAIMED': return 'border-purple-400';
      case 'SETTLEMENT': return 'border-success';
      default: return 'border-border-main';
    }
  };

  return (
    <div className="relative pl-8 space-y-0 ml-4">
      {entries.map((e, i) => (
        <div key={e.id} className="relative pb-6 last:pb-0">
          <div className={`absolute -left-[41px] top-0 w-8 h-8 rounded-full flex items-center justify-center bg-surface border-2 ${getLineColor(e.type)}`}>
            <ArrowDownCircle size={16} className={getLineColor(e.type).replace('border-', 'text-')} />
          </div>
          <button 
            onClick={() => onSelect(e)}
            className="w-full text-left p-4 bg-elevated rounded-xl border border-border-main hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-text-main uppercase">{e.type.replace(/_/g, ' ')}</span>
              <span className="text-xs text-text-dim">{new Date(e.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span>Amount: <span className="text-text-main font-medium">{e.amount !== '0' ? money(e.amount) : '—'}</span></span>
              {e.metadata?.txHash && (
                <span className="flex items-center gap-1 font-mono text-primary">
                  Tx: {e.metadata.txHash.slice(0, 16)}... <CopyButton text={e.metadata.txHash} />
                </span>
              )}
            </div>
          </button>
        </div>
      ))}
    </div>
  );
};

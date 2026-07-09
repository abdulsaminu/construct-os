import React, { useState } from 'react';
import { Milestone, Contractor } from '../../types';
import { Accordion } from '../ui/Accordion';
import { money } from '../../lib/api';
import { User, Wallet, Clock, CheckCircle, Lock } from 'lucide-react';

interface Props {
  milestones: Milestone[];
  contractors: Contractor[];
  onFund: (mId: string) => void;
  onClaim: (mId: string, cId: string) => void;
  onSettle: () => void;
  isSettling: boolean;
  projectStatus: string;
  lastError?: string;
}

export const MilestoneTimeline: React.FC<Props> = ({ 
  milestones, 
  contractors, 
  onFund, 
  onClaim, 
  onSettle, 
  isSettling, 
  projectStatus,
  lastError 
}) => {
  const [fundingError, setFundingError] = useState<string | null>(null);

  // Clear error when milestones change
  React.useEffect(() => {
    if (lastError) {
      setFundingError(lastError);
      // Auto-clear after 5 seconds
      const timer = setTimeout(() => setFundingError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastError]);

  const getContractor = (id?: string) => contractors.find(c => c.id === id);

  const getStateIcon = (m: Milestone) => {
    if (m.settled) return <CheckCircle aria-hidden='true' size={16} className="text-success" />;
    if (m.claimed) return <Clock aria-hidden='true' size={16} className="text-warning" />;
    if (m.funded) return <Clock aria-hidden='true' size={16} className="text-primary" />;
    return <div className="w-4 h-4 rounded-full border-2 border-text-dim" />;
  };

  // Determine if a milestone can be funded based on current state
  // Backend enforces sequential validation - we just show the UI state
  const canFund = (m: Milestone): boolean => {
    if (m.funded || m.claimed || m.settled) return false;
    if (projectStatus === 'completed') return false;
    return true;
  };

  const getAction = (m: Milestone) => {
    if (m.settled) {
      return <span className="text-caption font-semibold text-success flex items-center gap-1"><CheckCircle aria-hidden='true' size={16} /> On-Chain</span>;
    }

    if (m.claimed) {
      if (isSettling) return <span className="text-caption font-semibold text-warning animate-pulse">Mining on Arc...</span>;
      return (
        <button
          onClick={(e) => { e.stopPropagation(); onSettle(); }}
          className="bg-success/20 text-success hover:bg-success/30 px-4 py-3 rounded-8 text-caption font-bold transition-colors"
        >
          Settle on Arc
        </button>
      );
    }

    if (m.funded) {
      return (
        <button 
          onClick={(e) => { e.stopPropagation(); onClaim(m.id, m.payeeId || ''); }} 
          className="bg-warning/20 text-warning hover:bg-warning/30 px-4 py-3 rounded-8 text-caption font-bold transition-colors"
        >
          Claim
        </button>
      );
    }

    if (canFund(m)) {
      return (
        <button 
          onClick={(e) => { e.stopPropagation(); setFundingError(null); onFund(m.id); }} 
          className="bg-primary hover:bg-primary-hover text-white px-4 py-3 rounded-8 text-caption font-bold transition-colors"
        >
          Fund
        </button>
      );
    }

    // Locked state - previous milestone not completed yet
    return (
      <span className="text-caption font-semibold text-text-dim flex items-center gap-1 opacity-60">
        <Lock size={14} />
        Locked
      </span>
    );
  };

  return (
    <div className="space-y-3">
      {/* Show sequential validation error if present */}
      {fundingError && (
        <div className="bg-warning/10 border border-warning/50 text-warning px-4 py-3 rounded-card text-small flex items-center gap-2">
          <Lock size={16} />
          {fundingError}
        </div>
      )}

      {milestones.map(m => {
        const contractor = getContractor(m.payeeId);
        return (
          <Accordion
            key={m.id}
            id={m.id}
            defaultOpen={m.claimed && !m.settled}
            trigger={
              <div className="flex items-center justify-between w-full pr-2">
                <div className="flex items-center gap-3">
                  {getStateIcon(m)}
                  <div className="text-left">
                    <p className="text-small font-medium text-text-main">{m.name}</p>
                    <p className="text-caption text-text-dim">{money(m.budget)}</p>
                  </div>
                </div>
                {getAction(m)}
              </div>
            }
          >
            <div className="grid grid-cols-2 gap-4 text-small">
              <div>
                <p className="text-text-dim text-caption mb-1">Assigned Contractor</p>
                <div className="flex items-center gap-2">
                  <User aria-hidden='true' size={16} className="text-text-muted" />
                  <span className="font-medium text-text-main">{contractor?.name || 'Unassigned'}</span>
                </div>
              </div>
              <div>
                <p className="text-text-dim text-caption mb-1">Wallet</p>
                <div className="flex items-center gap-2">
                  <Wallet aria-hidden='true' size={16} className="text-text-muted" />
                  <span className="font-mono text-caption text-text-muted">{contractor?.payoutAddress ? `${contractor.payoutAddress.slice(0, 6)}...${contractor.payoutAddress.slice(-4)}` : 'N/A'}</span>
                </div>
              </div>
              <div className="col-span-2 grid grid-cols-3 gap-4 pt-2 border-t border-border-main">
                <StateFlag label="Funded" active={m.funded} />
                <StateFlag label="Claimed" active={m.claimed} />
                <StateFlag label="Settled" active={m.settled} />
              </div>
            </div>
          </Accordion>
        );
      })}
    </div>
  );
};

const StateFlag = ({ label, active }: { label: string; active: boolean }) => (
  <p className={`text-caption font-medium ${active ? 'text-success' : 'text-text-dim'}`}>{active ? '✓' : '○'} {label}</p>
);

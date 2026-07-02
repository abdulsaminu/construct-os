import React from 'react';
import { Milestone, Contractor } from '../../types';
import { Accordion } from '../ui/Accordion';
import { money } from '../../lib/api';
import { User, Wallet, Clock, CheckCircle } from 'lucide-react';

interface Props {
  milestones: Milestone[];
  contractors: Contractor[];
  onFund: (mId: string) => void;
  onClaim: (mId: string, cId: string) => void;
  onSettle: () => void; // Now handles the settle trigger
  isSettling: boolean;
  projectStatus: string;
}

export const MilestoneTimeline: React.FC<Props> = ({ milestones, contractors, onFund, onClaim, onSettle, isSettling, projectStatus }) => {
  const getContractor = (id?: string) => contractors.find(c => c.id === id);

  const getStateIcon = (m: Milestone) => {
    if (m.settled) return <CheckCircle size={16} className="text-success" />;
    if (m.claimed) return <Clock size={16} className="text-warning" />;
    if (m.funded) return <Clock size={16} className="text-primary" />;
    return <div className="w-4 h-4 rounded-full border-2 border-text-dim" />;
  };

  const getAction = (m: Milestone) => {
    if (m.settled) return <span className="text-caption font-semibold text-success flex items-center gap-1"><CheckCircle size={16} /> On-Chain</span>;
    
    // If claimed, show the Settle button right here!
    if (m.claimed) {
      if (isSettling) return <span className="text-caption font-semibold text-warning animate-pulse">Mining on Arc...</span>;
      return <button 
        onClick={(e) => { e.stopPropagation(); onSettle(); }} 
        className="bg-success/20 text-success hover:bg-success/30 px-4 py-2 rounded-8 text-caption font-bold transition-colors"
      >
        Settle on Arc
      </button>;
    }
    
    if (m.funded) return <button onClick={(e) => { e.stopPropagation(); onClaim(m.id, m.payeeId || ''); }} className="bg-warning/20 text-warning hover:bg-warning/30 px-4 py-2 rounded-8 text-caption font-bold transition-colors">Claim</button>;
    if (projectStatus !== 'completed') return <button onClick={(e) => { e.stopPropagation(); onFund(m.id); }} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-8 text-caption font-bold transition-colors">Fund</button>;
    return null;
  };

  return (
    <div className="space-y-3">
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
                  <User size={16} className="text-text-muted" />
                  <span className="font-medium text-text-main">{contractor?.name || 'Unassigned'}</span>
                </div>
              </div>
              <div>
                <p className="text-text-dim text-caption mb-1">Wallet</p>
                <div className="flex items-center gap-2">
                  <Wallet size={16} className="text-text-muted" />
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

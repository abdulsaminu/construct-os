import React, { useState } from 'react';
import { Contractor, AssignedProject } from '../../types';
import { Drawer } from '../ui/Drawer';
import { CopyButton } from '../ui/CopyButton';
import { User, Wallet, Calendar, Edit3, Check, X, FolderOpen } from 'lucide-react';
import { putter } from '../../lib/api';
import { money } from '../../lib/api';

interface Props {
  contractor: Contractor | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const ContractorDetailDrawer: React.FC<Props> = ({ contractor, isOpen, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [walletInput, setWalletInput] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = () => {
    setWalletInput(contractor?.payoutAddress || '');
    setError('');
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError('');
  };

  const saveWallet = async () => {
    if (!contractor) return;
    
    // Client-side validation
    if (!walletInput || !/^0x[a-fA-F0-9]{40}$/.test(walletInput)) {
      setError('Invalid EVM address. Must be 0x + 40 hex characters.');
      return;
    }

    setIsSaving(true);
    setError('');
    
    try {
      const res = await putter<{ error?: string }>(`/contractors/${contractor.id}`, { payoutAddress: walletInput });
      if (res.error) {
        setError(res.error);
      } else {
        setIsEditing(false);
        onUpdate();
      }
    } catch {
      setError('Failed to update wallet.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!contractor) return null;

  const assignedProjects = contractor.assignedProjects || [];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Contractor Details">
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-elevated rounded-card">
          <div className="p-3 bg-surface rounded-card text-primary"><User size={20} /></div>
          <div>
            <h3 className="text-body-lg font-bold text-text-main">{contractor.name}</h3>
            <p className="text-small text-success font-medium">Active</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Wallet Section */}
          <div className="flex items-start gap-3">
            <div className="text-text-dim mt-1"><Wallet size={16} /></div>
            <div className="flex-1">
              <p className="text-caption text-text-dim uppercase tracking-wide">Payout Wallet</p>
              
              {isEditing ? (
                <div className="mt-2 space-y-2">
                  <input
                    value={walletInput}
                    onChange={(e) => setWalletInput(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-surface border border-border-main rounded-input p-2 text-small font-mono text-text-main outline-none focus:border-primary"
                    autoFocus
                  />
                  {error && <p className="text-caption text-danger">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={saveWallet}
                      disabled={isSaving}
                      className="flex items-center gap-1 text-small text-success hover:bg-success/10 px-3 py-1.5 rounded-btn transition-colors disabled:opacity-50"
                    >
                      <Check size={14} /> {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 text-small text-text-muted hover:bg-elevated px-3 py-1.5 rounded-btn transition-colors"
                    >
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-small text-text-main font-mono break-all">
                    {contractor.payoutAddress || 'Not set'}
                  </p>
                  {contractor.payoutAddress && contractor.payoutAddress.startsWith('0x') && contractor.payoutAddress.length === 42 && (
                    <CopyButton text={contractor.payoutAddress} />
                  )}
                  <button
                    onClick={startEdit}
                    className="p-1.5 text-text-dim hover:text-primary hover:bg-primary/10 rounded-btn transition-colors"
                    aria-label="Edit wallet address"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <DetailRow icon={<Calendar size={16} />} label="Registered" value={new Date(contractor.registeredAt).toLocaleString()} />
        </div>

        <div className="border-t border-border-main pt-6">
          <h4 className="text-small font-semibold text-text-main mb-4 uppercase tracking-wide">Assigned Projects</h4>
          
          {assignedProjects.length === 0 ? (
            <p className="text-small text-text-dim bg-elevated p-4 rounded-card text-center">No projects assigned</p>
          ) : (
            <div className="space-y-2">
              {assignedProjects.map((p: AssignedProject) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-elevated rounded-card">
                  <div className="flex items-center gap-3">
                    <FolderOpen size={16} className="text-primary" />
                    <div>
                      <p className="text-small font-medium text-text-main">{p.name}</p>
                      <p className="text-caption text-text-dim">{p.currentMilestone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-small font-mono text-text-main">{money(p.totalBudget)}</p>
                    <p className="text-caption text-text-dim">{p.completionPercent}% complete</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};

const DetailRow = ({ icon, label, value, isMono, copyable }: any) => (
  <div className="flex items-start gap-3">
    <div className="text-text-dim mt-1">{icon}</div>
    <div className="flex-1">
      <p className="text-caption text-text-dim uppercase tracking-wide">{label}</p>
      <div className="flex items-center gap-2 mt-1">
        <p className={`text-small text-text-main break-all ${isMono ? 'font-mono' : ''}`}>{value}</p>
        {copyable && <CopyButton text={value} />}
      </div>
    </div>
  </div>
);

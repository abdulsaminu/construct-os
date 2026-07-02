import React, { useState } from 'react';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { poster } from '../../lib/api';
import { Plus, AlertCircle } from 'lucide-react';

interface Props {
  onDepositSuccess: () => void;
}

export const DepositCard: React.FC<Props> = ({ onDepositSuccess }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

  const handleDeposit = async () => {
    setError('');
    const rawAmount = amount.replace(/[^0-9]/g, '');
    
    if (!rawAmount) { setError("Amount required"); return; }
    if (parseInt(rawAmount) <= 0) { setError("Amount must be greater than zero"); return; }

    setIsDepositing(true);
    try {
      const res = await poster<{ error?: string }>('/economy/deposit', { amount: rawAmount });
      if (res.error) {
        setError(res.error);
      } else {
        setAmount('');
        onDepositSuccess();
      }
    } catch {
      setError("Unable to complete deposit. API timeout.");
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <Panel className="lg:col-span-4 col-span-12">
      <SectionHeader title="Deposit Capital" />
      <div className="mt-8 space-y-4">
        <div>
          <label htmlFor="deposit-amount" className="block text-small text-text-muted mb-2">Deposit Amount</label>
          <input
            id="deposit-amount"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={amount}
            onChange={e => { setAmount(e.target.value.replace(/[^0-9]/g, '')); setError(''); }}
            placeholder="e.g. 1000000"
            className="w-full bg-elevated border border-border-main rounded-12 p-3 text-text-main outline-none focus:border-primary transition-colors font-mono"
            aria-label="Deposit amount"
          />
        </div>
        
        {error && (
          <div className="flex items-center gap-2 text-danger text-caption bg-danger/10 p-3 rounded-8">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button 
          onClick={handleDeposit}
          disabled={isDepositing}
          className="w-full bg-primary hover:bg-primary-hover text-white p-4 rounded-12 font-semibold flex items-center justify-center gap-2 transition-colors duration-fast disabled:opacity-50"
          aria-label="Submit deposit"
        >
          <Plus size={20} />
          {isDepositing ? 'Processing...' : 'Deposit Capital'}
        </button>
      </div>
    </Panel>
  );
};

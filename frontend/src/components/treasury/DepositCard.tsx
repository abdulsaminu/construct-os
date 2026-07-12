import React, { useState } from 'react';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { poster } from '../../lib/api';
import { Plus, AlertCircle, Wallet } from 'lucide-react';
import { useAccount, useWriteContract } from 'wagmi';
import { USDC_ABI, USDC_ADDRESS, TREASURY_ADDRESS } from '../../lib/web3';

interface Props {
  onDepositSuccess: () => void;
}

type Step = 'idle' | 'awaiting-wallet' | 'verifying';

export const DepositCard: React.FC<Props> = ({ onDepositSuccess }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>('idle');

  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const isDepositing = step !== 'idle';

  const handleDeposit = async () => {
    setError('');
    const rawAmount = amount.replace(/[^0-9]/g, '');

    if (!rawAmount) { setError('Amount required'); return; }
    if (parseInt(rawAmount, 10) <= 0) { setError('Amount must be greater than zero'); return; }

    if (!isConnected) {
      setError('Connect a wallet (top right) to deposit — every deposit must be a real on-chain transaction.');
      return;
    }
    if (!TREASURY_ADDRESS) {
      setError('Treasury address not configured. Set VITE_TREASURY_ADDRESS in frontend/.env');
      return;
    }

    try {
      setStep('awaiting-wallet');
      const minorUnits = BigInt(rawAmount) * 1_000_000n;

      const txHash = await writeContractAsync({
        address: USDC_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [TREASURY_ADDRESS as `0x${string}`, minorUnits],
      });

      setStep('verifying');
      const res = await poster<{ error?: string }>('/economy/deposit-onchain', {
        txHash,
        amount: rawAmount,
        fromAddress: address,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setAmount('');
        onDepositSuccess();
      }
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || 'Deposit failed. Check your wallet and try again.');
    } finally {
      setStep('idle');
    }
  };

  const buttonLabel = !isConnected
    ? 'Connect Wallet to Deposit'
    : step === 'awaiting-wallet'
    ? 'Confirm in wallet...'
    : step === 'verifying'
    ? 'Verifying on-chain...'
    : 'Deposit Capital';

  return (
 <Panel className="lg:col-span-4 col-span-12">
      <SectionHeader title="Deposit Capital" />
 <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
 <label htmlFor="deposit-amount" className="block text-small text-text-muted">
            Deposit Amount (USDC, on-chain)
          </label>
          <span className="text-caption text-text-dim">Your Wallet</span>
        </div>
        <div>
          <input
            id="deposit-amount"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={amount}
            onChange={e => { setAmount(e.target.value.replace(/[^0-9]/g, '')); setError(''); }}
            placeholder="e.g. 20"
 className="w-full bg-elevated border border-border-main rounded-card p-3 text-text-main outline-none focus:border-primary transition-colors font-mono"
            aria-label="Deposit amount"
          />
        </div>

        {isConnected && address && (
          <p className="text-caption text-text-muted font-mono">
            Connected: {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        )}

        {error && (
 <div className="flex items-center gap-2 text-danger text-caption bg-danger/10 p-3 rounded-8">
 <AlertCircle aria-hidden='true' size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleDeposit}
          disabled={isDepositing}
 className="w-full bg-primary hover:bg-primary-hover text-white p-4 rounded-btn font-semibold flex items-center justify-center gap-2 transition-colors duration-fast disabled:opacity-50"
          aria-label="Submit deposit"
        >
          {!isConnected ? <Wallet aria-hidden='true' size={20} /> : <Plus aria-hidden='true' size={20} />}
          {buttonLabel}
        </button>
      </div>
    </Panel>
  );
};

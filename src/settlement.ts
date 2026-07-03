import { LedgerEntry } from './ledger.js';

export interface SettlementReceipt {
  id: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  error?: string;
  blockNumber?: number;
  gasUsed?: string;
  confirmedAt?: number;
}

export interface SettlementAdapter {
  submit(entries: LedgerEntry[]): Promise<SettlementReceipt[]>;
  getStatus(receiptId: string): Promise<SettlementReceipt>;
}

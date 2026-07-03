import { SettlementAdapter, SettlementReceipt } from './settlement.js';
import { LedgerEntry } from './ledger.js';
import { randomBytes } from 'crypto';

export class ArcSettlementAdapter implements SettlementAdapter {
  private currentBlock = 18942000 + Math.floor(Math.random() * 1000);

  async submit(entries: LedgerEntry[]): Promise<SettlementReceipt[]> {
    // Simulate blockchain mining/confirmation latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    return entries.map(entry => {
      this.currentBlock++;
      return {
        id: entry.id,
        status: 'confirmed',
        // Generate realistic 32-byte hex transaction hash (64 characters)
        txHash: '0x' + randomBytes(32).toString('hex'),
        blockNumber: this.currentBlock,
        gasUsed: (150000 + Math.floor(Math.random() * 50000)).toString(),
        confirmedAt: Date.now()
      };
    });
  }

  async getStatus(receiptId: string): Promise<SettlementReceipt> {
    return { id: receiptId, status: 'confirmed', txHash: '0x' + randomBytes(32).toString('hex') };
  }
}

import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import { loadCircleWallets } from './circle-wallet-store.js';
import type { SettlementReceipt } from './settlement-arc.js';

const ARC_TESTNET_USDC_TOKEN_ID = process.env.CIRCLE_USDC_TOKEN_ID || 'ef87c8c3-85de-598a-af50-c5135eecfa74';
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 20; // ~60s wait window, matching ArcSettlementAdapter's bounded wait

export class CircleSettlementAdapter {
  private client: ReturnType<typeof initiateDeveloperControlledWalletsClient>;

  constructor() {
    this.client = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY!,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
    });
  }

  private getTreasuryWalletId(): string {
    const registry = loadCircleWallets();
    const treasury = registry['constructos-treasury-main'];
    if (!treasury) throw new Error('No Circle treasury wallet found in data/circle-wallets.json');
    return treasury.walletId;
  }

  async submitSettlement(payeeAddress: string, amount: bigint): Promise<SettlementReceipt> {
    // Same defensive validation as ArcSettlementAdapter, to fail fast and
    // honestly rather than let a malformed address reach Circle's API.
    if (!payeeAddress || !/^0x[a-fA-F0-9]{40}$/.test(payeeAddress)) {
      return { id: crypto.randomUUID(), status: 'failed', reason: `Invalid payee address: ${payeeAddress}` };
    }

    let walletId: string;
    try {
      walletId = this.getTreasuryWalletId();
    } catch (err) {
      return { id: crypto.randomUUID(), status: 'failed', reason: String(err) };
    }

    try {
      const transferResponse = await this.client.createTransaction({
        walletId,
        tokenId: ARC_TESTNET_USDC_TOKEN_ID,
        destinationAddress: payeeAddress,
        amount: [amount.toString()],
        fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
      });

      const transactionId = transferResponse.data?.id;
      if (!transactionId) {
        return { id: crypto.randomUUID(), status: 'failed', reason: 'Circle createTransaction returned no transaction ID' };
      }

      // Bounded poll — mirrors ArcSettlementAdapter's honest-failure design:
      // if it doesn't confirm within the wait window, report failed/retryable
      // rather than hang or silently claim success.
      let currentState = transferResponse.data?.state ?? '';
      const terminalStates = new Set(['COMPLETE', 'FAILED', 'CANCELLED', 'DENIED']);
      let attempts = 0;

      while (!terminalStates.has(currentState) && attempts < MAX_POLL_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        const pollResponse = await this.client.getTransaction({ id: transactionId });
        currentState = pollResponse.data?.transaction?.state ?? '';
        attempts++;

        if (currentState === 'COMPLETE') {
          const tx = pollResponse.data!.transaction!;
          return {
            id: transactionId,
            status: 'confirmed',
            txHash: tx.txHash,
            blockNumber: tx.blockHeight,
            gasUsed: tx.networkFee ? BigInt(Math.round(parseFloat(tx.networkFee) * 1_000_000)) : undefined,
          };
        }
      }

      if (attempts >= MAX_POLL_ATTEMPTS) {
        return { id: transactionId, status: 'pending', reason: `Settlement still pending after ${MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 1000}s wait window` };
      }

      return { id: transactionId, status: 'failed', reason: `Circle transaction ended in state: ${currentState}` };
    } catch (error) {
      console.error('[CircleSettlement] Real settlement failed:', error);
      return { id: crypto.randomUUID(), status: 'failed', reason: String(error) };
    }
  }
}

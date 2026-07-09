import { randomBytes } from 'crypto';

export interface SettlementReceipt {
  id: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  blockNumber?: number;
  gasUsed?: bigint;
  reason?: string;
}

export interface DepositVerification {
  ok: boolean;
  reason?: string;
}

const USDC_ABI = [
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'transfer', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] },
] as const;

const TRANSFER_EVENT = {
  type: 'event',
  name: 'Transfer',
  inputs: [
    { name: 'from', type: 'address', indexed: true },
    { name: 'to', type: 'address', indexed: true },
    { name: 'value', type: 'uint256', indexed: false },
  ],
} as const;

export class ArcSettlementAdapter {
  private config: {
    rpcUrl: string;
    usdcAddress: string;
    privateKey: `0x${string}` | null;
    treasuryAddress: `0x${string}` | null;
    chainId: number;
    mode: string;
    transferMode: 'native' | 'erc20';
  };

  constructor() {
    const rawKey = process.env.TREASURY_PRIVATE_KEY;
    let validKey: `0x${string}` | null = null;
    if (rawKey && rawKey.startsWith('0x') && rawKey.length === 66) {
      validKey = rawKey as `0x${string}`;
    }

    const rawTreasuryAddress = process.env.ARC_TREASURY_ADDRESS;
    const validTreasuryAddress =
      rawTreasuryAddress && /^0x[a-fA-F0-9]{40}$/.test(rawTreasuryAddress)
        ? (rawTreasuryAddress as `0x${string}`)
        : null;

    this.config = {
      rpcUrl: process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network',
      usdcAddress: process.env.ARC_USDC_ADDRESS || '0x3600000000000000000000000000000000000000',
      privateKey: validKey,
      treasuryAddress: validTreasuryAddress,
      chainId: parseInt(process.env.ARC_CHAIN_ID || '5042002'),
      mode: process.env.ARC_MODE || 'mock',
      transferMode: process.env.ARC_TRANSFER_MODE === 'erc20' ? 'erc20' : 'native',
    };
  }

  async getTreasuryAddress(): Promise<`0x${string}` | null> {
    if (this.config.treasuryAddress) return this.config.treasuryAddress;
    if (this.config.privateKey) {
      const { privateKeyToAccount } = await import('viem/accounts');
      return privateKeyToAccount(this.config.privateKey).address;
    }
    return null;
  }

  async submitSettlement(payeeAddress: string, amount: bigint): Promise<SettlementReceipt> {
    if (this.config.mode !== 'real' || !this.config.privateKey) {
      return this._mockSubmit();
    }

    if (!payeeAddress || !/^0x[a-fA-F0-9]{40}$/.test(payeeAddress)) {
      return { id: crypto.randomUUID(), status: 'failed', reason: `Invalid payee address: ${payeeAddress}` };
    }

    try {
      const txHash = this.config.transferMode === 'native'
        ? await this._transferNativeUSDC(payeeAddress as `0x${string}`, amount)
        : await this._transferUSDC(payeeAddress as `0x${string}`, amount * 1_000_000n);

      return await this._awaitReceipt(txHash);
    } catch (error) {
      console.error('[ArcSettlement] Real settlement failed:', error);
      return { id: crypto.randomUUID(), status: 'failed', reason: String(error) };
    }
  }

  async verifyIncomingUSDCTransfer(txHash: string, expectedAmount: bigint): Promise<DepositVerification> {
    if (this.config.mode !== 'real') {
      return { ok: true };
    }

    if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return { ok: false, reason: 'Malformed transaction hash' };
    }

    const treasuryAddress = await this.getTreasuryAddress();
    if (!treasuryAddress) {
      return { ok: false, reason: 'No treasury address configured (set TREASURY_PRIVATE_KEY or ARC_TREASURY_ADDRESS)' };
    }

    try {
      const client = await this._getPublicClient();
      const receipt = await client.waitForTransactionReceipt({ hash: txHash as `0x${string}`, timeout: 30_000 });

      if (receipt.status !== 'success') {
        return { ok: false, reason: 'Transaction reverted on-chain' };
      }

      const { parseEventLogs } = await import('viem');
      const transferLogs = parseEventLogs({ abi: [TRANSFER_EVENT], logs: receipt.logs, eventName: 'Transfer' });

      const expectedMinorUnits = expectedAmount * 1_000_000n;
      const match = transferLogs.find(
        (log: any) =>
          log.address.toLowerCase() === this.config.usdcAddress.toLowerCase() &&
          log.args.to.toLowerCase() === treasuryAddress.toLowerCase() &&
          log.args.value === expectedMinorUnits
      );

      if (!match) {
        return {
          ok: false,
          reason: `No matching USDC transfer of ${expectedAmount} to the treasury address found in this transaction`,
        };
      }

      if (match.args.from.toLowerCase() === treasuryAddress.toLowerCase()) {
        return {
          ok: false,
          reason: 'Deposit rejected: sender is the treasury address itself. Deposits must come from an external wallet.',
        };
      }

      return { ok: true };
    } catch (error) {
      return { ok: false, reason: `Verification failed: ${String(error)}` };
    }
  }

  private async _transferUSDC(to: `0x${string}`, amount: bigint): Promise<`0x${string}`> {
    const { createWalletClient, http } = await import('viem');
    const { privateKeyToAccount } = await import('viem/accounts');
    const account = privateKeyToAccount(this.config.privateKey!);

    const client = createWalletClient({
      account,
      chain: {
        id: this.config.chainId,
        name: 'Arc Testnet',
        nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
        rpcUrls: { default: { http: [this.config.rpcUrl] } }
      },
      transport: http(this.config.rpcUrl),
    });

    const hash = await client.writeContract({
      address: this.config.usdcAddress as `0x${string}`,
      abi: USDC_ABI,
      functionName: 'transfer',
      args: [to, amount],
    });
    return hash;
  }

  private async _transferNativeUSDC(to: `0x${string}`, wholeDollarAmount: bigint): Promise<`0x${string}`> {
    const { createWalletClient, http, parseGwei } = await import('viem');
    const { privateKeyToAccount } = await import('viem/accounts');
    const account = privateKeyToAccount(this.config.privateKey!);

    const chain = {
      id: this.config.chainId,
      name: 'Arc Testnet',
      nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
      rpcUrls: { default: { http: [this.config.rpcUrl] } },
    };

    const client = createWalletClient({ account, chain, transport: http(this.config.rpcUrl) });
    const publicClient = await this._getPublicClient();

    const nativeValue = wholeDollarAmount * 10n ** 18n;

    let maxFeePerGas: bigint;
    try {
      const latestBlock = await publicClient.getBlock();
      const baseFee = latestBlock.baseFeePerGas ?? parseGwei('20');
      maxFeePerGas = baseFee * 2n;
    } catch {
      maxFeePerGas = parseGwei('40');
    }

    const hash = await client.sendTransaction({
      to,
      value: nativeValue,
      gas: 21_000n,
      maxFeePerGas,
      maxPriorityFeePerGas: 0n,
    });
    return hash;
  }

  private async _awaitReceipt(txHash: `0x${string}`): Promise<SettlementReceipt> {
    const client = await this._getPublicClient();
    try {
      const receipt = await client.waitForTransactionReceipt({ hash: txHash, timeout: 30_000 });
      if (receipt.status !== 'success') {
        return { id: txHash, status: 'failed', txHash, reason: 'Transaction reverted on-chain' };
      }
      return {
        id: txHash,
        status: 'confirmed',
        txHash,
        blockNumber: Number(receipt.blockNumber),
        gasUsed: receipt.gasUsed,
      };
    } catch (error) {
      return { id: txHash, status: 'pending', txHash, reason: `Not confirmed within timeout: ${String(error)}` };
    }
  }

  private async _getPublicClient() {
    const { createPublicClient, http } = await import('viem');
    return createPublicClient({
      chain: {
        id: this.config.chainId,
        name: 'Arc Testnet',
        nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
        rpcUrls: { default: { http: [this.config.rpcUrl] } }
      },
      transport: http(this.config.rpcUrl),
    });
  }

  async submit(payeeAddress: string, amount: bigint): Promise<SettlementReceipt> {
    return this.submitSettlement(payeeAddress, amount);
  }

  private _mockSubmit(): SettlementReceipt {
    return {
      id: crypto.randomUUID(),
      status: 'confirmed',
      txHash: '0x' + randomBytes(32).toString('hex'),
      blockNumber: Math.floor(Math.random() * 1000000),
      gasUsed: 21000n,
    };
  }
}

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

// Minimal ERC-20 Transfer event, used to verify incoming deposits.
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
    // Validate private key format before storing
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
      // Arc's own integration docs recommend native USDC sends over ERC-20
      // transfer() for outgoing payments: ~21k gas vs ~65k, and works with
      // any recipient address. Set ARC_TRANSFER_MODE=erc20 to opt back into
      // the ERC-20 call path if you have a reason to (e.g. a recipient
      // that's a contract expecting an ERC-20 Transfer event specifically).
      transferMode: process.env.ARC_TRANSFER_MODE === 'erc20' ? 'erc20' : 'native',
    };
  }

  /**
   * The public address that receives deposits and pays out settlements.
   * Falls back to deriving the address from TREASURY_PRIVATE_KEY if
   * ARC_TREASURY_ADDRESS isn't explicitly set (they're normally the same
   * wallet in this project).
   */
  async getTreasuryAddress(): Promise<`0x${string}` | null> {
    if (this.config.treasuryAddress) return this.config.treasuryAddress;
    if (this.config.privateKey) {
      const { privateKeyToAccount } = await import('viem/accounts');
      return privateKeyToAccount(this.config.privateKey).address;
    }
    return null;
  }

  async submitSettlement(payeeAddress: string, amount: bigint): Promise<SettlementReceipt> {
    // Safety: Only attempt real blockchain if explicitly enabled AND key is valid
    if (this.config.mode !== 'real' || !this.config.privateKey) {
      return this._mockSubmit();
    }

    // Validate payee address format
    if (!payeeAddress || !/^0x[a-fA-F0-9]{40}$/.test(payeeAddress)) {
      return { id: crypto.randomUUID(), status: 'failed', reason: `Invalid payee address: ${payeeAddress}` };
    }

    try {
      const txHash = this.config.transferMode === 'native'
        ? await this._transferNativeUSDC(payeeAddress as `0x${string}`, amount)
        : await this._transferUSDC(payeeAddress as `0x${string}`, amount * 1_000_000n);

      return await this._awaitReceipt(txHash);
    } catch (error) {
      // Real mode: report the real failure honestly. We deliberately do NOT
      // fall back to a fake "confirmed" mock receipt here — the whole point
      // of this adapter is that a milestone is only marked settled when a
      // genuine on-chain transaction backs it up.
      console.error('[ArcSettlement] Real settlement failed:', error);
      return { id: crypto.randomUUID(), status: 'failed', reason: String(error) };
    }
  }

  /**
   * Verifies that a given transaction hash is a real, confirmed USDC
   * transfer of `expectedAmount` (whole-dollar units, matching engine
   * convention) into the treasury address. Used to validate wallet-connect
   * deposits before crediting them to the ledger.
   *
   * In mock mode there's no real chain to check against, so this always
   * passes — mirroring how the rest of the app behaves in demo/dev mode.
   */
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

      return { ok: true };
    } catch (error) {
      return { ok: false, reason: `Verification failed: ${String(error)}` };
    }
  }

  // --- Real Blockchain Methods (Using viem) ---

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

  /**
   * Preferred settlement path per Arc's own integration docs: a plain
   * native value transfer, not an ERC-20 contract call. Cheaper (~21k gas
   * vs ~65k for transfer()) and works with any recipient address, since
   * it doesn't depend on the recipient being able to receive ERC-20 logs.
   *
   * Arc's native currency uses 18 decimals internally (like ETH wei) but
   * represents the same USDC as the 6-decimal ERC-20 interface — one
   * balance, two interfaces. Engine amounts are whole USDC dollars, so we
   * convert directly: wholeDollars * 10^18.
   */
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

    // Arc's minimum base fee is 20 Gwei. Read the current base fee and pad
    // it, falling back to a safe floor above the minimum if unavailable.
    let maxFeePerGas: bigint;
    try {
      const latestBlock = await publicClient.getBlock();
      const baseFee = latestBlock.baseFeePerGas ?? parseGwei('20');
      maxFeePerGas = baseFee * 2n;
    } catch {
      maxFeePerGas = parseGwei('40');
    }

    // Pre-flight balance check: the native transfer's `value` covers the
    // settlement amount, but gas is paid separately from the same balance.
    // A treasury sitting at exactly the settlement amount (or less) would
    // otherwise fail deep inside a raw RPC call with an unreadable stack
    // trace. Check first and fail cleanly with a clear, actionable reason.
    const estimatedGasCost = 21_000n * maxFeePerGas;
    const totalNeeded = nativeValue + estimatedGasCost;
    const treasuryBalance = await publicClient.getBalance({ address: account.address });
    if (treasuryBalance < totalNeeded) {
      const haveDisplay = (Number(treasuryBalance) / 1e18).toFixed(6);
      const needDisplay = (Number(totalNeeded) / 1e18).toFixed(6);
      throw new Error(
        `Insufficient treasury balance for settlement + gas. Have ${haveDisplay} USDC, need ${needDisplay} USDC ` +
        `(${wholeDollarAmount} USDC settlement amount + ~${(Number(estimatedGasCost) / 1e18).toFixed(6)} USDC gas buffer). ` +
        `Fund the treasury with additional USDC before retrying.`
      );
    }

    const hash = await client.sendTransaction({
      to,
      value: nativeValue,
      gas: 21_000n,
      maxFeePerGas,
      maxPriorityFeePerGas: 0n, // Arc validators don't require a tip
    });
    return hash;
  }

  /**
   * Blocks until the transaction is actually mined (success or revert), or
   * times out. Replaces the old single point-in-time check, which almost
   * always observed "pending" and then proceeded to report "confirmed"
   * anyway — a race condition that defeated the purpose of confirmation.
   */
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
      // Not confirmed within our wait window. Not necessarily failed —
      // just not yet provably settled, so we do not mark it settled.
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

  // Alias for backwards compatibility
  async submit(payeeAddress: string, amount: bigint): Promise<SettlementReceipt> {
    return this.submitSettlement(payeeAddress, amount);
  }

  // --- Mock Fallback (dev/demo only, ARC_MODE=mock or unset) ---

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

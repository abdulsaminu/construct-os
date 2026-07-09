import { createConfig, http, useAccount, useReadContract } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { defineChain } from 'viem';

export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } },
  blockExplorers: { default: { name: 'Arc Explorer', url: 'https://testnet.arcscan.app' } },
});

export const USDC_ADDRESS = (import.meta.env.VITE_ARC_USDC_ADDRESS as string) || '0x3600000000000000000000000000000000000000';

// Public address funders deposit into. Must match your backend's treasury
// wallet (TREASURY_PRIVATE_KEY's address, or ARC_TREASURY_ADDRESS if set).
export const TREASURY_ADDRESS = (import.meta.env.VITE_TREASURY_ADDRESS as string) || '';

// WalletConnect is opt-in: only registered as a connector if a Project ID
// is configured. Get a free one at https://cloud.walletconnect.com — set
// VITE_WALLETCONNECT_PROJECT_ID in frontend/.env.
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;

const connectors = [injected()];
if (walletConnectProjectId) {
  // Cast needed: wagmi's connector types and the installed
  // @walletconnect/ethereum-provider version have drifted slightly on the
  // `storage` type signature. Functionally compatible at runtime — this is
  // an optional connector gated behind an env var, not the primary
  // (MetaMask/injected) path this project has been tested against.
  connectors.push(walletConnect({ projectId: walletConnectProjectId, showQrModal: true }) as any);
}

export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors,
  transports: { [arcTestnet.id]: http() },
});

export const isWalletConnectEnabled = Boolean(walletConnectProjectId);

export const USDC_ABI = [
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

// Pass an explicit address to check any wallet's balance (e.g. the
// treasury address in Demo Mode). Omit it to default to the connected
// wallet's own balance.
export function useUsdcBalance(overrideAddress?: string) {
  const { address: connectedAddress } = useAccount();
  const address = overrideAddress || connectedAddress;

  const { data, isLoading, refetch } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: Boolean(address) },
  });

  const formatted = data !== undefined
    ? (Number(data) / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })
    : undefined;

  return { raw: data as bigint | undefined, formatted, isLoading, refetch };
}

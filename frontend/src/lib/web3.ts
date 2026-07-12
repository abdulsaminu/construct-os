import { createConfig, http, useAccount, useReadContract } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { defineChain } from 'viem';

export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'Arc Explorer', url: 'https://testnet.arcscan.app' },
  },
});

export const USDC_ADDRESS = (import.meta.env.VITE_ARC_USDC_ADDRESS as string) || '0x3600000000000000000000000000000000000000';
export const TREASURY_ADDRESS = (import.meta.env.VITE_TREASURY_ADDRESS as string) || '';

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;

const connectors = [injected()];
if (walletConnectProjectId) {
  connectors.push(walletConnect({ projectId: walletConnectProjectId, showQrModal: true }) as any);
}

export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors,
  transports: {
    [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
  },
  ssr: true,
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

// Usage: node scripts/check-balance.mjs 0xYourAddressHere
import { createPublicClient, http, formatUnits } from 'viem';

const address = process.argv[2];
if (!address) {
  console.error('Usage: node check-balance.mjs 0xYourAddressHere');
  process.exit(1);
}

const ARC_RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
const ARC_USDC_ADDRESS = process.env.ARC_USDC_ADDRESS || '0x3600000000000000000000000000000000000000';
const ARC_CHAIN_ID = parseInt(process.env.ARC_CHAIN_ID || '5042002');

const client = createPublicClient({
  chain: {
    id: ARC_CHAIN_ID,
    name: 'Arc Testnet',
    nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
    rpcUrls: { default: { http: [ARC_RPC_URL] } },
  },
  transport: http(ARC_RPC_URL),
});

const balanceOfAbi = [
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
];

const balance = await client.readContract({
  address: ARC_USDC_ADDRESS,
  abi: balanceOfAbi,
  functionName: 'balanceOf',
  args: [address],
});

console.log(`${address}: ${formatUnits(balance, 6)} USDC`);

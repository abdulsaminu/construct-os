import { createPublicClient, http } from 'viem';
const hash = process.argv[2];
const client = createPublicClient({
  chain: { id: 5042002, name: 'Arc Testnet', nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 }, rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } } },
  transport: http(),
});
try {
  const receipt = await client.getTransactionReceipt({ hash });
  console.log('FOUND ON-CHAIN:', JSON.stringify(receipt, (k,v) => typeof v === 'bigint' ? v.toString() : v, 2));
} catch (err) {
  console.log('NOT FOUND ON-CHAIN:', err.shortMessage || err.message);
}

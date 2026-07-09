// Usage: node scripts/test-settlement.mjs 0xContractorAddress 1
// Sends `amount` USDC (native transfer, matching settlement-arc.ts's default path)
import { createWalletClient, createPublicClient, http, parseGwei } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import fs from 'fs';

const to = process.argv[2];
const amount = BigInt(process.argv[3] || '1');

if (!to) {
  console.error('Usage: node test-settlement.mjs 0xContractorAddress <amount>');
  process.exit(1);
}

const env = fs.readFileSync('.env', 'utf8');
const pkLine = env.split('\n').find(l => l.startsWith('TREASURY_PRIVATE_KEY='));
const privateKey = pkLine.split('=')[1].trim();

const chain = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } },
};

const account = privateKeyToAccount(privateKey);
const walletClient = createWalletClient({ account, chain, transport: http() });
const publicClient = createPublicClient({ chain, transport: http() });

console.log(`Sending ${amount} USDC from ${account.address} to ${to}...`);

const value = amount * 10n ** 18n;
const latestBlock = await publicClient.getBlock();
const maxFeePerGas = (latestBlock.baseFeePerGas ?? parseGwei('20')) * 2n;

const hash = await walletClient.sendTransaction({
  to,
  value,
  gas: 21_000n,
  maxFeePerGas,
  maxPriorityFeePerGas: 0n,
});

console.log(`Tx submitted: ${hash}`);
console.log('Waiting for confirmation...');

const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 30_000 });

console.log(`Status: ${receipt.status}`);
console.log(`Block: ${receipt.blockNumber}`);
console.log(`Gas used: ${receipt.gasUsed}`);
console.log(`Explorer: https://testnet.arcscan.app/tx/${hash}`);

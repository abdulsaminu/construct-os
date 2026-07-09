import { createPublicClient, http, pad } from 'viem';

const address = '0x301beA650715C96698f9Aef8DF86548B124aFb92';
const client = createPublicClient({
  chain: { id: 5042002, name: 'Arc Testnet', nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 }, rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } } },
  transport: http(),
});

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const paddedAddress = pad(address, { size: 32 });

const CHUNK = 9500n;
let fromBlock = 50663968n;
const toBlockFinal = 50825436n;

const allOut = [];
const allIn = [];

while (fromBlock <= toBlockFinal) {
  const toBlock = fromBlock + CHUNK > toBlockFinal ? toBlockFinal : fromBlock + CHUNK;

  const outLogs = await client.getLogs({
    address: '0xfffffffffffffffffffffffffffffffffffffffe',
    topics: [TRANSFER_TOPIC, paddedAddress, null],
    fromBlock,
    toBlock,
  });
  const inLogs = await client.getLogs({
    address: '0xfffffffffffffffffffffffffffffffffffffffe',
    topics: [TRANSFER_TOPIC, null, paddedAddress],
    fromBlock,
    toBlock,
  });

  allOut.push(...outLogs);
  allIn.push(...inLogs);
  fromBlock = toBlock + 1n;
}

console.log('--- OUTGOING (contractor sent) ---');
allOut.forEach(l => {
  const value = BigInt(l.data);
  const to = '0x' + l.topics[2].slice(26);
  console.log(`Block ${l.blockNumber} | sent to ${to} | ${Number(value) / 1e18} USDC | tx: ${l.transactionHash}`);
});
if (allOut.length === 0) console.log('(none)');

console.log('--- INCOMING (contractor received) ---');
allIn.forEach(l => {
  const value = BigInt(l.data);
  const from = '0x' + l.topics[1].slice(26);
  console.log(`Block ${l.blockNumber} | received from ${from} | ${Number(value) / 1e18} USDC | tx: ${l.transactionHash}`);
});
if (allIn.length === 0) console.log('(none)');

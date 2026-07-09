import { createPublicClient, http, pad } from 'viem';

const address = process.argv[2];
const client = createPublicClient({
  chain: { id: 5042002, name: 'Arc Testnet', nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 }, rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } } },
  transport: http(),
});

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const paddedAddress = pad(address, { size: 32 });

const latest = await client.getBlockNumber();
const fromBlock = latest - 20000n > 0n ? latest - 20000n : 0n;

// Outgoing: address is the sender (topic1)
const outLogs = await client.getLogs({
  address: '0xfffffffffffffffffffffffffffffffffffffffe',
  topics: [TRANSFER_TOPIC, paddedAddress, null],
  fromBlock,
  toBlock: latest,
});

// Incoming: address is the recipient (topic2)
const inLogs = await client.getLogs({
  address: '0xfffffffffffffffffffffffffffffffffffffffe',
  topics: [TRANSFER_TOPIC, null, paddedAddress],
  fromBlock,
  toBlock: latest,
});

const decode = (log, direction) => {
  const value = BigInt(log.data);
  const other = direction === 'OUT' ? '0x' + log.topics[2].slice(26) : '0x' + log.topics[1].slice(26);
  return { block: log.blockNumber, direction, other, value: Number(value) / 1e18, tx: log.transactionHash };
};

const all = [
  ...outLogs.map(l => decode(l, 'OUT to')),
  ...inLogs.map(l => decode(l, 'IN from')),
].sort((a, b) => Number(a.block - b.block));

if (all.length === 0) {
  console.log('No transfers found in the last 20000 blocks');
} else {
  all.forEach(t => console.log(`Block ${t.block} | ${t.direction} ${t.other} | ${t.value} USDC | tx: ${t.tx}`));
}

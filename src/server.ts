import http from 'http';
import { JsonFileStore } from './store.js';
import { handleApiRequest, ApiResponse } from './api.js';
import { CFELState } from './engine.js';
import { ArcSettlementAdapter } from './settlement-arc.js';
import { serializeBigInts } from './serialize.js';

const PORT = parseInt(process.env.PORT || '3001');
const STATE_FILE = process.env.STATE_FILE || './data/constructos.json';

const store = new JsonFileStore(STATE_FILE);
const arcSettlement = new ArcSettlementAdapter({ rpcUrl: 'https://rpc.arc.io', chainId: 1, contractAddress: '0x1234...' });

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  let body = null;
  if (req.method === 'POST') {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString();
    if (raw) body = JSON.parse(raw);
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const params: Record<string, string> = {};
  url.searchParams.forEach((v, k) => { params[k] = v; });

  try {
    const state = await store.load();
    const response: ApiResponse = handleApiRequest(state, { method: req.method || 'GET', path: url.pathname, body, params });

    if (response.newState) {
      let finalState = response.newState;

      // INTERCEPT: If completing a project, trigger the Arc Blockchain Settlement
      if (url.pathname.endsWith('/complete') && response.statusCode === 200) {
        const newSettlements = finalState.ledger.filter(e => e.type === 'SETTLEMENT' && !e.metadata?.txHash);
        if (newSettlements.length > 0) {
          // Send to Arc (This will take 1.5s to simulate mining)
          const receipts = await arcSettlement.submit(newSettlements);
          
          // Inject TX hashes immutably into the ledger
          finalState = {
            ...finalState,
            ledger: finalState.ledger.map(e => {
              const receipt = receipts.find(r => r.id === e.id);
              if (receipt && receipt.txHash) {
                return { ...e, metadata: { ...e.metadata, txHash: receipt.txHash, blockNumber: receipt.blockNumber, gasUsed: receipt.gasUsed } };
              }
              return e;
            })
          };
        }
      }
      await store.save(finalState);
    }

    const safeStringify = (obj: any) => JSON.stringify(obj, (key, value) => typeof value === 'bigint' ? value.toString() : value);

    res.writeHead(response.statusCode, { 'Content-Type': 'application/json' });
    res.end(safeStringify(response.body));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: String(err) }));
  }
});

server.listen(PORT, () => {
  console.log(`ConstructOS v0.3.0 (Arc Settlement Active)`);
  console.log(`Listening on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => { server.close(() => process.exit(0)); });

import 'dotenv/config';
import http from 'http';
import { JsonFileStore } from './store.js';
import { handleApiRequest, ApiResponse } from './api.js';
import { CFELState, dispatch, getSettlementCandidates } from './engine.js';
import { ArcSettlementAdapter } from './settlement-arc.js';
import { serializeBigInts } from './serialize.js';

const PORT = parseInt(process.env.PORT || '3001');
const STATE_FILE = process.env.STATE_FILE || './data/constructos.json';

const store = new JsonFileStore(STATE_FILE);
const arcSettlement = new ArcSettlementAdapter();

const safeStringify = (obj: any) => JSON.stringify(obj, (key, value) => typeof value === 'bigint' ? value.toString() : value);

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  let body = null;
  if (req.method === 'POST' || req.method === 'PUT') {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString();
    if (raw) body = JSON.parse(raw);
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const params: Record<string, string> = {};
  url.searchParams.forEach((v, k) => { params[k] = v; });

  try {
    // ---------------------------------------------------------------------
    // SPECIAL ROUTE: wallet-connect deposit confirmation.
    // This requires a real RPC call to verify the transaction, so it's
    // handled here (the impure shell) rather than in api.ts's pure,
    // synchronous handleApiRequest. Only after verification succeeds do we
    // dispatch DEPOSIT_CAPITAL.
    // ---------------------------------------------------------------------
    if (req.method === 'POST' && url.pathname === '/economy/deposit-onchain') {
      const { txHash, amount, fromAddress } = (body || {}) as { txHash?: string; amount?: string | number; fromAddress?: string };

      if (!txHash || amount === undefined || amount === null) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'txHash and amount are required' }));
        return;
      }

      let parsedAmount: bigint;
      try {
        parsedAmount = BigInt(amount);
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'amount must be a whole number (USDC, no decimals)' }));
        return;
      }

      if (parsedAmount <= 0n) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'amount must be greater than zero' }));
        return;
      }

      const verification = await arcSettlement.verifyIncomingUSDCTransfer(txHash, parsedAmount);
      if (!verification.ok) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: verification.reason || 'Deposit could not be verified on-chain' }));
        return;
      }

      const state = await store.load();
      const result = dispatch(state, {
        type: 'DEPOSIT_CAPITAL',
        payload: { amount: parsedAmount, txHash, fromAddress },
      });

      if (!result.success) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: result.error }));
        return;
      }

      await store.save(result.state);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(safeStringify(result.state.economy));
      return;
    }

    const state = await store.load();
    const response: ApiResponse = handleApiRequest(state, { method: req.method || 'GET', path: url.pathname, body, params });

    // Handle demo reset
    if (response.resetState) {
      await store.reset();
      res.writeHead(response.statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response.body));
      return;
    }

    // ---------------------------------------------------------------------
    // SPECIAL ROUTE: project completion / settlement.
    // api.ts's /complete handler is now validation-only and returns the
    // list of milestones pending settlement WITHOUT mutating anything. We
    // submit each one to Arc Testnet here, and only dispatch
    // CONFIRM_SETTLEMENT for milestones that come back with a genuinely
    // confirmed receipt. Anything else (failed or still pending after our
    // wait window) is recorded via RECORD_SETTLEMENT_FAILURE so it stays
    // claimed-but-unsettled and can be retried by hitting /complete again.
    // ---------------------------------------------------------------------
    if (url.pathname.endsWith('/complete') && response.statusCode === 200) {
      const { project, pendingSettlements } = response.body as {
        project: { id: string };
        pendingSettlements: { milestoneId: string; payeeId: string; amount: bigint | string }[];
      };
      const projectId = project.id;

      let currentState = state;

      for (const settlement of pendingSettlements) {
        const contractor = currentState.contractors.find(c => c.id === settlement.payeeId);
        const walletAddress = contractor?.payoutAddress;

        if (!walletAddress) {
          const failResult = dispatch(currentState, {
            type: 'RECORD_SETTLEMENT_FAILURE',
            payload: { projectId, milestoneId: settlement.milestoneId, error: `Contractor ${settlement.payeeId} has no payout address on file` },
          });
          if (failResult.success) currentState = failResult.state;
          continue;
        }

        try {
          const receipt = await arcSettlement.submitSettlement(walletAddress, BigInt(settlement.amount));

          if (receipt.status === 'confirmed' && receipt.txHash) {
            const confirmResult = dispatch(currentState, {
              type: 'CONFIRM_SETTLEMENT',
              payload: {
                projectId,
                milestoneId: settlement.milestoneId,
                txHash: receipt.txHash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed,
              },
            });
            if (confirmResult.success) {
              currentState = confirmResult.state;
            } else {
              console.error(`[Settlement] CONFIRM_SETTLEMENT rejected: ${confirmResult.error}`);
            }
          } else {
            const failResult = dispatch(currentState, {
              type: 'RECORD_SETTLEMENT_FAILURE',
              payload: {
                projectId,
                milestoneId: settlement.milestoneId,
                error: receipt.reason || `Settlement not confirmed (status: ${receipt.status})`,
              },
            });
            if (failResult.success) currentState = failResult.state;
          }
        } catch (err) {
          console.error('[Settlement] submit() threw:', err);
          const failResult = dispatch(currentState, {
            type: 'RECORD_SETTLEMENT_FAILURE',
            payload: { projectId, milestoneId: settlement.milestoneId, error: String(err) },
          });
          if (failResult.success) currentState = failResult.state;
        }
      }

      await store.save(currentState);
      const finalProject = currentState.projects.find(p => p.id === projectId);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(safeStringify(finalProject));
      return;
    }

    if (response.newState) {
      await store.save(response.newState);
    }

    res.writeHead(response.statusCode, { 'Content-Type': 'application/json' });
    res.end(safeStringify(response.body));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: String(err) }));
  }
});

server.listen(PORT, () => {
  console.log(`ConstructOS v0.4.0 (Demo Ready)`);
  console.log(`Listening on http://localhost:${PORT}`);
  console.log(`Arc Mode: ${process.env.ARC_MODE || 'mock'}`);
});

process.on('SIGTERM', () => { server.close(() => process.exit(0)); });

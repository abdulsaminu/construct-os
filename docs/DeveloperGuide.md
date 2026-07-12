# Developer Guide

## Folder Structure

```
construct-os/
├── src/                        # Backend — CFEL engine + HTTP server
│   ├── engine.ts               # THE core: pure reducer (dispatch function)
│   ├── api.ts                  # HTTP route handler — pure, synchronous, no I/O
│   ├── server.ts               # Node http server entry point + blockchain orchestration
│   ├── economy.ts              # Capital pool types + conservation invariant
│   ├── execution.ts            # Project, Milestone, Contractor domain types + factories
│   ├── ledger.ts                # LedgerEntry type + filter functions
│   ├── events.ts               # EventBus (pub/sub) for side effects
│   ├── risk.ts                 # Multi-factor risk scoring
│   ├── forecast.ts             # Cash flow + completion forecasting
│   ├── allocation.ts           # Priority-ranked capital allocation
│   ├── settlement.ts           # SettlementAdapter interface
│   ├── settlement-arc.ts       # Real Arc Testnet settlement + deposit verification
│   ├── demo-data.ts            # Seed data for the demo workspace
│   ├── store.ts                # JsonFileStore + InMemoryStore
│   ├── serialize.ts            # BigInt ↔ JSON safe serialization
│   ├── multi-tenant.ts         # Multi-tenant org registry
│   ├── index.ts                # Barrel re-exports
│   └── db/                     # PostgreSQL (scaffold only, not wired up)
├── frontend/
│   └── src/
│       ├── App.tsx             # Page router (state-based, lazy-loaded)
│       ├── main.tsx            # App bootstrap — wagmi + wallet mode providers
│       ├── vite-env.d.ts       # Vite env-var type declarations
│       ├── pages/              # One file per page — fetches data, renders components
│       ├── components/
│       │   ├── ui/             # Reusable primitives (Panel, Badge, Table, etc.)
│       │   ├── layout/         # AppShell, Sidebar, TopBar, NavigationItem
│       │   ├── wallet/         # ConnectWalletButton, ConnectWalletModal
│       │   └── [domain]/       # Domain components grouped by feature
│       ├── lib/
│       │   ├── api.ts          # fetcher<T>, poster<T>, putter<T>, deleter<T>, money()
│       │   ├── web3.ts         # wagmi/viem config, useUsdcBalance()
│       │   └── walletMode.tsx  # Demo Treasury Mode vs User Wallet Mode context
│       ├── types/
│       │   └── index.ts        # All TypeScript interfaces
│       └── index.css           # Tailwind + component layer CSS
├── test/                       # Backend unit tests
├── scripts/                    # Standalone chain-verification utilities (check-balance.mjs, check-tx.mjs)
└── data/                       # Runtime JSON state file
```

## Coding Conventions

### Backend

- **All monetary values are `bigint`, and represent whole dollars** (not minor units). Never use `number` for money. The API layer serializes to strings. Conversion to on-chain minor units (6 decimals for the USDC ERC-20 interface, 18 for native transfers) happens only inside `settlement-arc.ts`, at the point of an actual blockchain call — nowhere else in the codebase should be multiplying or dividing by `10^6`/`10^18`.
- **The reducer must be pure**. No side effects, no I/O, no random numbers, no network calls. `dispatch()` takes state + command, returns new state + events.
- **Blockchain I/O never happens inside `engine.ts` or `api.ts`.** Anything that needs to talk to Arc Testnet (submitting a settlement, verifying a deposit's transaction hash) is handled directly in `server.ts`, which then dispatches a reducer command with the *result* of that I/O (e.g. a confirmed `txHash`) — the reducer itself never initiates a chain call. See "The Settlement Pattern" below before adding anything that touches the chain.
- **Immutable updates only**. Always spread objects and arrays: `{ ...state, projects: [...state.projects] }`.
- **Capital conservation is sacred**. After every dispatch, `assertConservation()` runs. If it throws, the command is rejected.
- **Use `crypto.randomUUID()`** for all IDs (project, milestone, contractor, ledger entry).
- **Event types are literal unions** (`src/ledger.ts`): `"CAPITAL_DEPOSIT" | "PROJECT_CREATED" | "CONTRACTOR_ASSIGNED" | "MILESTONE_FUNDED" | "MILESTONE_CLAIMED" | "SETTLEMENT" | "SETTLEMENT_FAILED" | "PROJECT_CLOSED" | "PROJECT_DELETED" | "CONTRACTOR_DELETED" | "CAPITAL_RELEASED"`. Add new types to this union before using them in `createLedgerEntry()` — TypeScript will reject an unlisted type.

### Frontend

- **Frontend never computes financial *values***. Display pre-formatted strings from the API, formatted with `money()`. The one deliberate exception: when a wallet is connected (User Wallet Mode), the frontend constructs and signs real blockchain transactions via `wagmi`/`viem` — that's a genuine capability, not a values computation, and it's fine for it to live client-side.
- **Use design tokens** from `tailwind.config.js`. Never use raw pixel values, default Tailwind text sizes (`text-sm`, `text-base`), or arbitrary hex colors. See `docs/DesignSystem.md`.
- **All amounts are `string`** in the TypeScript types, except live on-chain balances read via `useUsdcBalance()`, which return a formatted display string plus the raw `bigint` if you need it.
- **Pages are lazy-loaded** with `React.lazy()` and wrapped in `<Suspense>`.
- **Use semantic HTML**: `<th scope="col">`, `role="progressbar"`, `aria-label` on icon buttons, `role="alert"` for toasts.
- **Component composition**: UI primitives → domain components → pages. Never skip layers.

## The Settlement Pattern (read before touching settlement code)

Settlement is deliberately split across the pure/impure boundary, and this pattern is
worth understanding before extending it:

1. `COMPLETE_PROJECT` (in `engine.ts`, pure) — validates which milestones are eligible.
   Mutates nothing.
2. `server.ts` (impure) — for each eligible milestone, calls
   `ArcSettlementAdapter.submitSettlement()`, which submits a real transaction and
   *waits for it to actually confirm on-chain* before returning.
3. `CONFIRM_SETTLEMENT` (in `engine.ts`, pure) — the *only* command that marks a
   milestone `settled`. It requires a `txHash` argument and will refuse to run without
   one. `server.ts` only dispatches this after step 2 returns a genuinely confirmed receipt.
4. `RECORD_SETTLEMENT_FAILURE` (in `engine.ts`, pure) — dispatched instead of step 3 if
   step 2's transaction fails or times out. Records an audit entry, touches nothing else,
   leaves the milestone retryable.

**Why this matters if you're adding a new feature that touches the chain**: don't add a
new reducer command that both mutates settlement/deposit state *and* assumes success —
split it the same way. Validate in the reducer, do I/O in `server.ts`, confirm in the
reducer only once you have a real result in hand. An earlier version of this codebase
didn't follow this pattern and could mark things settled based on a mocked/faked
success — that bug is why this split exists now.

## Adding a New Page

1. **Create the page component** in `frontend/src/pages/YourPage.tsx`:
   ```tsx
   import { useState, useEffect } from 'react';
   import { fetcher } from '../lib/api';

   export function YourPage() {
     const [data, setData] = useState(null);
     useEffect(() => { fetcher<YourType>('/your-endpoint').then(setData); }, []);
     if (!data) return <div>Loading...</div>;
     return <div>{/* render */}</div>;
   }
   ```

2. **Add the lazy import** in `frontend/src/App.tsx`:
   ```tsx
   const YourPage = lazy(() => import('./pages/YourPage').then(m => ({ default: m.YourPage })));
   ```

3. **Add to the pages map** in `App.tsx`:
   ```tsx
   pages: { ..., 'your-page': <YourPage /> }
   ```

4. **Add to PAGE_META** in `frontend/src/components/layout/AppShell.tsx`:
   ```tsx
   'your-page': { title: 'Your Page', description: 'Description here' }
   ```

5. **Add sidebar navigation** in `frontend/src/components/layout/Sidebar.tsx` if applicable.

## Adding a New Reducer Command

1. **Define the command type** in `src/engine.ts`:
   ```ts
   | { type: "YOUR_COMMAND"; payload: { projectId: string; /* ... */ } }
   ```

2. **Add the case** in the `dispatch()` switch statement. Follow the pattern:
   - Shallow-clone state
   - Validate preconditions (return `{ success: false, error }` if invalid)
   - Produce new state immutably
   - Append ledger entries to `events` and `newState.ledger`
   - `assertConservation()` runs automatically at the end
   - **If this command needs to reflect the result of a blockchain call, don't put the call here** — see "The Settlement Pattern" above.

3. **Add the API route.** If it's pure/synchronous, add it to `src/api.ts`:
   ```ts
   if (method === 'POST' && /* path match */) {
     const result = dispatch(state, { type: 'YOUR_COMMAND', payload: { /* ... */ } });
     if (!result.success) return { statusCode: 400, body: { error: result.error } };
     return { statusCode: 200, body: /* response */, newState: result.state };
   }
   ```
   If it needs real I/O (blockchain, external API), add it directly in `src/server.ts`
   instead, before the generic `handleApiRequest()` call — see the existing
   `/economy/deposit-onchain` and `/complete` handling for the pattern.

4. **Add tests** in `test/engine.test.ts`:
   ```ts
   it('handles YOUR_COMMAND', () => {
     const result = dispatch(state, { type: 'YOUR_COMMAND', payload: { ... } });
     assert(result.success);
     // assert new state shape
   });
   ```
   **Note:** as of this writing, the settlement-confirmation flow itself
   (`CONFIRM_SETTLEMENT`, `RECORD_SETTLEMENT_FAILURE`) has no automated test coverage —
   it was verified manually against real Arc Testnet transactions. Adding proper tests
   for it (with a mocked `ArcSettlementAdapter`) would be valuable follow-up work.

## API Conventions

- **GET requests** are read-only projections. They never modify state.
- **POST requests** dispatch commands to the reducer, or (for blockchain-touching routes) orchestrate real I/O in `server.ts` before dispatching. They return the new state portion + status code 200/201, or error with 400.
- **BigInt serialization**: The server uses `JSON.stringify` with a replacer that converts `bigint` to `string`. The frontend receives all monetary values as whole-dollar strings.
- **CORS**: Enabled for all origins (`Access-Control-Allow-Origin: *`).
- **No authentication**: Currently open. Multi-tenant infrastructure exists (`src/multi-tenant.ts`) but is not wired into the HTTP layer.

## Testing

Run tests with `npm test` from the repository root. Tests use Node's built-in test runner via `tsx --test`. The test files in `test/` import the reducer and API handler directly — no HTTP server needed for unit tests.

## Verifying On-Chain Behavior Manually

Two scripts in `scripts/` let you check real chain state directly, independent of the
app's own reporting — useful when developing or debugging anything settlement-related:

```bash
node scripts/check-balance.mjs 0xAnyAddress
node scripts/check-tx.mjs 0xTransactionHash
```

# Judge Walkthrough — ConstructOS

## What to Look For

### 1. Open the Repository

Start with the README. It contains:
- Architecture diagram showing the CFEL pattern and the real Arc Testnet connection
- Technology stack table
- On-chain verification section (chain ID, explorer, contract address)
- Repository layout with every file explained
- Installation instructions

### 2. Examine the Backend (`src/`)

**Start with `src/engine.ts`** — This is the heart of the system:
- The `dispatch()` function is a pure reducer: `(state, command) → { success, state, events }` or `{ success, error }`
- 11 command types handle the entire financial lifecycle, including deposit, funding, claiming, deletion, and a deliberately split two-command settlement flow (`COMPLETE_PROJECT` validates, `CONFIRM_SETTLEMENT` finalizes — see below)
- Every state transition produces immutable copies (spread operators, never mutation)
- `assertConservation()` runs after every dispatch to enforce the capital invariant

**Then look at `src/economy.ts`** — a small module defining the capital model:
- `totalCapital`, `lockedCapital`, `settledCapital` are all `bigint`
- `getAvailableCapital()` is a derived value: `total - locked - settled`
- `assertConservation()` throws if the invariant is violated

**Check `src/serialize.ts`** — BigInt-safe JSON serialization:
- Uses `{ __bi: "value" }` tagging to prevent numeric string corruption
- Recursive serialization/deserialization handles nested objects

**Review `src/api.ts`** — the pure, synchronous route handler:
- Simple path matching, no framework
- Every mutating route dispatches a command to the reducer
- BigInt values are stringified for JSON transport
- Deliberately does **not** handle routes that need real blockchain I/O (settlement submission, on-chain deposit verification) — those live in `src/server.ts` instead, so this file stays pure and synchronous

**Look at `src/settlement-arc.ts`** — the real Arc Testnet integration:
- `submitSettlement()` — submits a genuine transaction (native USDC transfer by default) and waits for on-chain confirmation before returning
- `verifyIncomingUSDCTransfer()` — validates a deposit's transaction hash against the chain (correct recipient, correct amount, real sender that isn't the treasury itself) before it's trusted
- Falls back to instant mock receipts only when `ARC_MODE` is unset or `mock`

**Look at `src/settlement-circle.ts`** — the Circle Developer-Controlled Wallets integration:
- Implements the same `submitSettlement(payeeAddress, amount)` signature as `ArcSettlementAdapter`, so it is a drop-in alternative, not a separate code path
- Submits via Circle's `createTransaction` API and polls `getTransaction()` within a bounded wait window before returning a receipt
- Selected instead of the Arc adapter by setting `SETTLEMENT_MODE=circle` (default is `arc`) — see `src/server.ts` for the selection logic

### 3. Examine the Frontend (`frontend/src/`)

**Look at `lib/api.ts`** — Typed HTTP client:
- `fetcher<T>(url)`, `poster<T>(url, body)`, `putter<T>`, `deleter<T>` — generic typed wrappers
- `money(value)` — `Intl.NumberFormat` USD formatter
- Frontend never computes financial *values* from these

**Look at `lib/web3.ts` and `lib/walletMode.tsx`** — the wallet-connect layer:
- `wagmi`/`viem` configuration for Arc Testnet
- `useUsdcBalance()` — reads a live on-chain balance for any address, used for the Wallet Balance KPI
- `WalletModeProvider` — toggles between Demo Treasury Mode (no wallet required) and User Wallet Mode (connect your own, sign your own transactions), persisted across page reloads

**Check `App.tsx`** — State-based routing:
- All pages are `React.lazy()` loaded
- Navigation is via `setPage()` state
- `Suspense` with skeleton fallbacks

**Look at any page** (e.g., `pages/DashboardPage.tsx`):
- Fetches data in `useEffect` with typed API calls
- Passes data to domain components

**Examine `components/ui/`** — design primitives:
- `Panel`, `MetricCard`, `Table`, `Drawer`, `Badge`, `Toast`, `Select` (with keyboard nav)
- All use semantic design tokens from `tailwind.config.js`

### 4. Review the Design System

**Open `frontend/tailwind.config.js`**:
- Typography, shadow, border-radius, and animation-duration design tokens

**Open `frontend/src/index.css`**:
- WCAG AA focus-visible outlines
- Reduced motion media query
- Component-layer classes (btn-primary, form-input, card-interactive)

### 5. Check the Tests

**Open `test/engine.test.ts`**:
- Tests the reducer directly — no HTTP server needed
- Tests capital conservation invariant
- Tests error cases (insufficient funds, already funded, etc.)
- **Note:** the settlement-confirmation flow (`CONFIRM_SETTLEMENT`, `RECORD_SETTLEMENT_FAILURE`) is not yet covered by this suite — it was built and verified via manual on-chain testing rather than automated tests. Worth asking about if test coverage matters to your evaluation.

### 6. Run It

```bash
# Backend
npm install
cp .env.example .env   # set ARC_MODE=real + TREASURY_PRIVATE_KEY for real settlement,
                        # or leave ARC_MODE=mock to run entirely offline
npm run dev

# Frontend (another terminal)
cd frontend
npm install
cp .env.example .env   # set VITE_TREASURY_ADDRESS to match your backend's treasury wallet
npm run dev
```

Open `http://localhost:5173`.

### 7. Try the Full Lifecycle

1. **Dashboard** — See the live wallet balance and capital overview
2. **Connect a wallet** (top bar) — Switch from Demo Treasury Mode to your own MetaMask, or stay in Demo Mode
3. **Treasury → Deposit** — Add capital (a real signed transaction if a wallet is connected, verified on-chain before being credited)
4. **Portfolio → New Project** — Create with milestones
5. **Project Detail → Fund** — Fund a milestone (watch capital move from available to locked)
6. **Project Detail → Claim** — Contractor claims work
7. **Project Detail → Complete** — Submits a real transaction to Arc Testnet and only marks the milestone settled once it's confirmed on-chain
8. **Ledger** — See the immutable event log with real on-chain proof — click any `txHash` to verify independently on `testnet.arcscan.app`
9. **Intelligence → Risk** — Multi-factor risk scoring
10. **Intelligence → Forecasts** — Cash flow projections
11. **Portfolio / Contractors** — Try deleting a project or contractor with no funded work in progress (blocked if funded work exists)

## What Makes This Different

1. **Deterministic financial engine**: Same inputs always produce same outputs. No hidden state, no database triggers, no framework magic.
2. **BigInt arithmetic**: Floating point would corrupt values at scale. We use native BigInt for exact arithmetic.
3. **Capital conservation invariant**: Mathematically enforced at every state transition. Impossible to create or destroy money.
4. **Real blockchain settlement, not simulated**: Genuine transaction hashes, block numbers, and gas usage from Arc Testnet — independently verifiable, not injected metadata.
5. **Settlement is honest, not optimistic**: A milestone only shows as settled after a confirmed on-chain receipt. If confirmation fails, it's recorded as failed and stays retryable — it never silently reports a fake success.
6. **Non-custodial wallet option**: Connect your own wallet and sign your own deposits. ConstructOS never touches funds it wasn't explicitly and verifiably sent.
7. **Zero framework backend**: The entire API server is built on Node's `http` module directly. No Express, no Fastify, no Koa.

## Common Questions

**Q: Why not use Express?**
A: The API has simple path matching and no complex routing needs. A framework adds overhead without benefit here. The reducer is the interesting part, not the HTTP layer.

**Q: Why BigInt instead of a decimal library?**
A: Construction budgets are in whole currency units (cents are not tracked at this level). BigInt provides exact integer arithmetic with zero dependencies and native runtime performance.

**Q: Why not use a database?**
A: The current `JsonFileStore` with atomic writes (temp file + rename) is sufficient for the demo. The architecture supports swapping to any store via the `StateStore` interface. A PostgreSQL migration scaffold exists in `src/db/` but isn't wired up yet.

**Q: Is the settlement really on-chain, or simulated?**
A: Real, when `ARC_MODE=real` — which is the intended running mode, not a special demo flag. Every settlement's ledger entry includes a genuine `txHash` you can paste into `testnet.arcscan.app` to verify independently of anything ConstructOS itself reports. It falls back to instant simulated receipts only when explicitly run in `mock` mode (useful for offline UI development).

**Q: Is Circle Wallets actually part of the settlement flow, or just a proof of concept?**
A: It's wired into the live settlement flow. Setting `SETTLEMENT_MODE=circle` routes real
settlements through Circle's Developer-Controlled Wallets `createTransaction` API instead
of the direct viem path - same reducer, same ledger, same UI, verified end-to-end through
the actual product, not a standalone script. `arc` remains the default because it has the
longer track record in this project.

**Q: What happens if a blockchain transaction fails or times out?**
A: The milestone stays claimed-but-unsettled, a `SETTLEMENT_FAILED` audit entry is recorded with the failure reason, and completing the project again will retry it. It will never show as settled without a real confirmed receipt behind it.

**Q: Is the frontend doing any financial calculations?**
A: Not on values — all monetary amounts are pre-formatted strings from the API, formatted only with `Intl.NumberFormat` for display. It does construct and sign real blockchain transactions when a wallet is connected, which is a deliberate capability, not a calculation.

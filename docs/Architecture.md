# Architecture

## CFEL: Construction Finance Economic Layer

ConstructOS is built on the CFEL architecture — a financial operating system where every state change is a deterministic function of the current state and a command. There are no side effects in the core reducer. No database triggers. No mutable global variables. Just `dispatch(state, command) → newState`.

### The Reducer Pattern

The central function in the system is `dispatch()` in `src/engine.ts`. It takes the current `CFELState` and a `Command`, and returns either a new state with emitted events or an error. The state is never mutated in place — every transition produces a fresh object tree.

```
CFELState ──┐
             ├── dispatch(state, command) ──→ CommandResult
Command ─────┘                                  │
                                                 ├── success: { state, events }
                                                 └── failure: { error }
```

The `CFELState` contains four domains:

| Domain | Type | Description |
|--------|------|-------------|
| `economy` | `{ totalCapital: bigint, lockedCapital: bigint, settledCapital: bigint }` | The capital pool |
| `projects` | `Project[]` | All construction projects with milestones |
| `contractors` | `Contractor[]` | Registered contractors with payout addresses |
| `ledger` | `LedgerEntry[]` | Immutable append-only event log |

### Capital Conservation Invariant

After every `dispatch()` call, the system asserts:

```
available = totalCapital - lockedCapital - settledCapital
```

This invariant is enforced by `assertConservation()` in `src/economy.ts`. If any reducer path violates it, the command is rejected and the previous state is preserved. This makes it impossible to create or destroy capital through any API operation — deposits are the only way to increase `totalCapital`.

## Event Sourcing

While the current implementation uses direct state mutation in the reducer, the ledger acts as an event log. Every financial operation appends a `LedgerEntry` to the ledger:

| Event Type | Triggered By | Records |
|------------|-------------|---------|
| `CAPITAL_DEPOSIT` | `DEPOSIT_CAPITAL` command | Amount added to treasury — includes `txHash`/`fromAddress` in metadata when the deposit was verified on-chain |
| `PROJECT_CREATED` | `CREATE_PROJECT` command | New project registered |
| `CONTRACTOR_ASSIGNED` | `CREATE_PROJECT` command | A contractor assigned to one or more milestones |
| `MILESTONE_FUNDED` | `FUND_MILESTONE` command | Capital locked for milestone |
| `MILESTONE_CLAIMED` | `CLAIM_MILESTONE` command | Contractor claims completed work |
| `SETTLEMENT` | `CONFIRM_SETTLEMENT` command | Capital settled to contractor — only dispatched after a real confirmed on-chain receipt; includes `txHash`, `blockNumber`, `gasUsed` |
| `SETTLEMENT_FAILED` | `RECORD_SETTLEMENT_FAILURE` command | A settlement attempt that could not be confirmed on-chain; audit-trail only, does not touch economy or milestone state — the milestone stays claimed-but-unsettled and retryable |
| `PROJECT_CLOSED` | `CONFIRM_SETTLEMENT` command (when the last milestone on a project settles) | Project marked completed |
| `PROJECT_DELETED` | `DELETE_PROJECT` command | Project removed (blocked if any milestone is funded) |
| `CONTRACTOR_DELETED` | `DELETE_CONTRACTOR` command | Contractor removed (blocked if they have any funded milestone on any project) |

Each event is immutable once written. The `EventBus` in `src/events.ts` provides a publish/subscribe mechanism for future event-driven side effects (notifications, webhooks, audit trails).

## Treasury System

The treasury is the capital pool managed by the `Economy` type in `src/economy.ts`. Capital exists in three states:

```
┌─────────────────────────────────────────────┐
│            totalCapital (BigInt)             │
│                                             │
│  ┌───────────┐ ┌──────────┐ ┌───────────┐  │
│  │ Available  │ │  Locked  │ │  Settled  │  │
│  │ (fundable) │ │ (assigned│ │ (paid    │  │
│  │            │ │  to ms) │ │  out)    │  │
│  └───────────┘ └──────────┘ └───────────┘  │
│                                             │
│  Invariant: Available + Locked + Settled    │
│             = totalCapital                  │
└─────────────────────────────────────────────┘
```

- **Available**: Capital that can be used to fund new milestones
- **Locked**: Capital committed to funded but unsettled milestones
- **Settled**: Capital that has been paid out to contractors after a confirmed on-chain settlement

## Settlement System

Settlement is deliberately split into two phases so that a milestone can never show as
`settled` without a real, verifiable transaction behind it:

1. **Validation (`COMPLETE_PROJECT` command, pure reducer)** — Identifies claimed-but-unsettled
   milestones on the project and returns them as candidates. This step mutates nothing — no
   ledger entry, no state change. If there's nothing eligible, it returns an error and stops here.
2. **Submission (`server.ts`, outside the reducer)** — For each candidate milestone, `server.ts`
   calls `ArcSettlementAdapter.submitSettlement()`, which submits a real transaction to Arc
   Testnet (a native USDC transfer by default) and waits for it to actually confirm on-chain.
3. **Confirmation (`CONFIRM_SETTLEMENT` command, pure reducer)** — Only dispatched by `server.ts`
   once step 2 returns a genuinely confirmed receipt. This is the only command that marks a
   milestone `settled`, moves capital from locked to settled, and writes the `SETTLEMENT` ledger
   entry (with real `txHash`/`blockNumber`/`gasUsed`).
4. **Failure handling** — If step 2's transaction fails or can't be confirmed within the wait
   window, `server.ts` dispatches `RECORD_SETTLEMENT_FAILURE` instead. This writes an audit-trail
   `SETTLEMENT_FAILED` entry but touches nothing else — the milestone remains claimed-but-unsettled
   and can be retried by completing the project again.

This split exists because an earlier version of the adapter silently fell back to a fake
"confirmed" receipt on any real-mode error, which meant a milestone could show as settled
with no matching on-chain transaction. The current design makes that impossible by
construction: the reducer itself has no code path that marks something settled without a
`txHash` argument, and that argument only ever comes from a real confirmed receipt.

`src/server.ts` selects between two concrete settlement implementations at runtime via
the `SETTLEMENT_MODE` environment variable, defaulting to `arc`:

- **`ArcSettlementAdapter`** (`src/settlement-arc.ts`) — submits a direct viem transaction
  to Arc Testnet, and falls back to instant mock receipts only when `ARC_MODE` is unset or
  explicitly `mock`.
- **`CircleSettlementAdapter`** (`src/settlement-circle.ts`) — submits the same settlement
  via Circle's Developer-Controlled Wallets `createTransaction` API, polling for a
  confirmed receipt within a bounded wait window, selected with `SETTLEMENT_MODE=circle`.

Both implementations expose the same `submitSettlement(payeeAddress, amount) ->
SettlementReceipt` signature, so `server.ts` can swap between them with a single
conditional and no change to the reducer, the ledger, or the settlement-confirmation flow
above. (A generic `SettlementAdapter` interface exists in `src/settlement.ts` from early
scaffolding but is not the mechanism actually used for this swap — `server.ts` references
the concrete adapter classes directly.)

## Risk Engine

The risk engine in `src/risk.ts` computes multi-factor risk scores for each active project:

| Factor | Weight | Computation |
|--------|--------|-------------|
| Schedule Risk | 30% | Percentage of milestones funded |
| Funding Risk | 30% | Percentage of milestones remaining to fund |
| Liquidity Risk | 20% | Project's share of total locked capital |
| Contractor Risk | 20% | Percentage of budget with assigned contractors |

The composite score is a weighted average (0–100), where lower is better. This is a
deterministic heuristic scoring system, not a machine-learning model — worth being precise
about that distinction if asked.

## Intelligence Engine

The intelligence module aggregates data from multiple backend services:

- **Risk Matrix**: Portfolio-wide risk scoring with per-factor breakdown
- **Capital Allocation**: Priority-ranked funding recommendations (`rankAllocations()`)
- **Cash Flow Forecast**: 90-day cash flow projection across available/locked/settled
- **System Health**: Derived service health from data availability and API latency

All intelligence computations are read-only projections over the current state — they never mutate the reducer state.

## Backend Architecture

The backend uses **zero framework dependencies**. The HTTP server in `src/server.ts` is built on Node's native `http` module. Request routing for pure/synchronous operations is handled by simple path matching in `src/api.ts`; routes that need real blockchain I/O (settlement submission, on-chain deposit verification) are handled directly in `server.ts` instead, since `api.ts`'s handler is intentionally kept pure and synchronous. State is loaded from disk on every request (via `JsonFileStore`), dispatched through the pure reducer, and saved back atomically (write to temp file → rename).

This design means:
- No ORM, no Express, no middleware chains
- The backend has 3 runtime dependencies: `viem` (blockchain utils), `pg` (PostgreSQL driver, for future use — not yet wired up), and `dotenv` (loads `.env` into `process.env`)
- The reducer is fully testable in isolation without any HTTP context

## Frontend Architecture

The frontend is a **pure visualization layer** for financial data — it performs zero financial calculations, and all amounts are pre-serialized strings from the API. It does, however, sign and submit its own blockchain transactions when in User Wallet Mode (via `wagmi`/`viem`), which is a genuine client-side capability, not just visualization. The frontend:

- Fetches data via typed API wrappers (`fetcher<T>`, `poster<T>`, `putter<T>`, `deleter<T>`)
- Formats amounts with `Intl.NumberFormat` for display
- Never parses, converts, or computes financial *values* — but does construct and sign real transactions when connected to a wallet
- Uses state-based page routing with `React.lazy()` for code splitting
- Reads live on-chain balances directly (via `wagmi`'s `useReadContract`) for the Wallet Balance KPI, independent of the backend's internal ledger figures

This separation means the reducer's financial logic can be completely decoupled from any
particular frontend (mobile app, CLI, different framework) without touching business logic
— though the wallet-signing capability is inherently a client-side concern and would need
reimplementing in any replacement frontend.

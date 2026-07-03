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
| `CAPITAL_DEPOSIT` | `DEPOSIT_CAPITAL` command | Amount added to treasury |
| `MILESTONE_FUNDED` | `FUND_MILESTONE` command | Capital locked for milestone |
| `MILESTONE_CLAIMED` | `CLAIM_MILESTONE` command | Contractor claims completed work |
| `SETTLEMENT` | `COMPLETE_PROJECT` command | Capital settled to contractor |

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
- **Settled**: Capital that has been paid out to contractors after project completion

## Settlement System

The settlement process is triggered by the `COMPLETE_PROJECT` command. When a project is completed:

1. The reducer identifies all claimed-but-unsettled milestones
2. For each, it creates a `SETTLEMENT` ledger entry
3. The server intercepts the response and submits settlements to the Arc blockchain adapter
4. The adapter simulates mining (1.5s delay) and returns transaction hashes
5. TX hashes are injected into the ledger entries immutably

The settlement layer is abstracted behind the `SettlementAdapter` interface in `src/settlement.ts`, making it trivial to swap Arc for Ethereum, Optimism, or any other chain.

## Risk Engine

The risk engine in `src/risk.ts` computes multi-factor risk scores for each active project:

| Factor | Weight | Computation |
|--------|--------|-------------|
| Schedule Risk | 30% | Percentage of milestones funded |
| Funding Risk | 30% | Percentage of milestones remaining to fund |
| Liquidity Risk | 20% | Project's share of total locked capital |
| Contractor Risk | 20% | Percentage of budget with assigned contractors |

The composite score is a weighted average (0–100), where lower is better.

## Intelligence Engine

The intelligence module aggregates data from multiple backend services:

- **Risk Matrix**: Portfolio-wide risk scoring with per-factor breakdown
- **Capital Allocation**: Priority-ranked funding recommendations (`rankAllocations()`)
- **Cash Flow Forecast**: 90-day cash flow projection across available/locked/settled
- **System Health**: Derived service health from data availability and API latency

All intelligence computations are read-only projections over the current state — they never mutate the reducer state.

## Backend Architecture

The backend uses **zero framework dependencies**. The HTTP server in `src/server.ts` is built on Node's native `http` module. Request routing is handled by simple path matching in `src/api.ts`. State is loaded from disk on every request (via `JsonFileStore`), dispatched through the pure reducer, and saved back atomically (write to temp file → rename).

This design means:
- No ORM, no Express, no middleware chains
- The entire backend has 2 runtime dependencies: `viem` (blockchain utils) and `pg` (PostgreSQL driver, for future use)
- The reducer is fully testable in isolation without any HTTP context

## Frontend Architecture

The frontend is a **pure visualization layer**. It performs zero financial calculations — all amounts are pre-serialized strings from the API. The frontend:

- Fetches data via typed API wrappers (`fetcher<T>`, `poster<T>`)
- Formats amounts with `Intl.NumberFormat` for display
- Never parses, converts, or computes financial values
- Uses state-based page routing with `React.lazy()` for code splitting

This separation means the frontend can be completely replaced (mobile app, CLI, different framework) without touching any financial logic.
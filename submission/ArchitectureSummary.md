# Architecture Summary — ConstructOS

## System Overview

ConstructOS is a two-package monorepo: a Node.js backend implementing the CFEL financial engine, and a React frontend serving as a pure visualization layer.

```
┌──────────────────────────────────────────────────────┐
│  Browser (React + Vite)                              │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Pages (lazy-loaded)                         │   │
│  │  ┌─────────┐ ┌────────┐ ┌─────────────────┐  │   │
│  │  │Dashboard│ │Treasury│ │  Intelligence   │  │   │
│  │  └────┬────┘ └───┬────┘ └───────┬─────────┘  │   │
│  │       │          │              │            │   │
│  │  ┌────▼──────────▼──────────────▼─────────┐  │   │
│  │  │  lib/api.ts (fetcher<T>, poster<T>)    │  │   │
│  │  └──────────────────┬─────────────────────┘  │   │
│  └─────────────────────┼────────────────────────┘   │
│                        │ /api/* (proxy)              │
└────────────────────────┼────────────────────────────┘
                         │ HTTP
┌────────────────────────┼────────────────────────────┐
│  Backend (Node.js)     │                            │
│                        │                            │
│  ┌─────────────────────▼──────────────────────┐    │
│  │  api.ts — 18 REST routes                   │    │
│  └─────────────────────┬──────────────────────┘    │
│                        │ dispatch(command)          │
│  ┌─────────────────────▼──────────────────────┐    │
│  │  engine.ts — Pure Reducer                   │    │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────┐  │    │
│  │  │ economy  │ │ projects │ │  ledger    │  │    │
│  │  │ (BigInt) │ │ (domain) │ │ (events)   │  │    │
│  │  └──────────┘ └──────────┘ └────────────┘  │    │
│  └─────────────────────┬──────────────────────┘    │
│                        │ assertConservation()       │
│  ┌─────────────────────▼──────────────────────┐    │
│  │  store.ts — JSON persistence (atomic)       │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌──────────────────┐  ┌────────────────────────┐  │
│  │ risk.ts          │  │ settlement-arc.ts      │  │
│  │ forecast.ts      │  │ (blockchain proof)     │  │
│  │ allocation.ts    │  └────────────────────────┘  │
│  └──────────────────┘                               │
└──────────────────────────────────────────────────────┘
```

## Key Architectural Decisions

### 1. Pure Reducer (No Framework)

The entire financial engine is a single `dispatch(state, command)` function. No Express, no Fastify, no ORM. The HTTP layer is 40 lines of Node's built-in `http` module. This makes the core logic:
- Fully testable without any HTTP context
- Trivially composable (pass state through any transport)
- Impossible to have hidden side effects

### 2. BigInt for Financial Arithmetic

All monetary values are `bigint`. The serializer converts `{ __bi: "250000000000" }` for JSON persistence and string for API responses. The frontend receives strings and formats with `Intl.NumberFormat`. Zero financial computation happens in the browser.

### 3. Capital Conservation Invariant

After every dispatch, the system asserts: `available + locked + settled === totalCapital`. If violated, the command is rejected and the previous state is returned. This mathematical guarantee makes it impossible to create or destroy capital through any API operation.

### 4. Frontend as Visualization Layer

The React frontend performs zero financial calculations. It fetches pre-serialized data, formats strings for display, and renders UI. This means:
- The frontend can be completely replaced (mobile app, CLI, different framework)
- No risk of frontend-backend calculation divergence
- All business logic lives in one place: the reducer

### 5. Immutable Event Log

Every financial operation appends a `LedgerEntry` to the ledger array. Entries are never modified — settlement TX hashes are injected via object spreading into new state, not mutation. This provides a complete, tamper-proof financial audit trail.

### 6. Blockchain Settlement Abstraction

The `SettlementAdapter` interface abstracts blockchain interaction. The current `ArcSettlementAdapter` simulates mining with realistic TX hashes. Swapping to Ethereum, Optimism, or any EVM chain requires implementing one interface with two methods: `submit()` and `getStatus()`.

## Data Flow Example: Funding a Milestone

```
1. User clicks "Fund" in UI
2. Frontend: poster('/projects/:id/milestones/fund', { milestoneId })
3. Backend api.ts: dispatch(state, { type: 'FUND_MILESTONE', payload })
4. Backend engine.ts:
   a. Find project and milestone
   b. Validate: not already funded, sufficient available capital
   c. Mark milestone as funded
   d. Lock capital: lockedCapital += milestone.budget
   e. Append MILESTONE_FUNDED event to ledger
   f. assertConservation() — passes
   g. Return { success: true, state: newState, events }
5. Backend server.ts: save state to disk (atomic write)
6. Response: updated project JSON
7. Frontend: re-renders with new state
```

## Performance Characteristics

| Metric | Value |
|--------|-------|
| Backend cold start | < 100ms |
| API response time | < 5ms (in-memory state) |
| Frontend initial load | 165KB JS (53KB gzip) |
| Frontend page navigation | Instant (lazy-loaded, no router overhead) |
| State file size | ~50KB for typical portfolio |
| Blockchain settlement | 1.5s simulated (adapter-dependent) |
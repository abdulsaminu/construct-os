# ConstructOS

**Construction Financial Operating System** — A deterministic, event-sourced financial engine for construction project capital management, built on the CFEL (Construction Finance Economic Layer) architecture, with real on-chain settlement on Arc Testnet.

> **Note:** Early commit history in this repository references "Lepton," an artifact of
> this repo's original scaffold naming. **ConstructOS is unrelated to the separate Lepton
> Construction Inspector Agent project** — they share no code, and were built for different
> purposes. This project is the Autonomous Construction Finance & Settlement Platform.

## The Problem

Construction projects manage significant capital across dozens of milestones, contractors, and payment cycles. Traditional financial systems treat construction funds as generic accounting entries, losing critical context: which milestone is funded, which contractor is assigned, what capital is locked versus available, and when settlements actually occur on-chain. This creates funding bottlenecks, settlement delays, audit nightmares, and zero real-time visibility into capital flow.

## Why CFEL Exists

CFEL (Construction Finance Economic Layer) is a purpose-built financial operating system that models construction economics as a **pure reducer** over an immutable event stream. Every financial operation — deposits, milestone funding, contractor claims, settlements — is a **command dispatched to a deterministic reducer** that produces a new state and appends immutable ledger events. All monetary values use **BigInt** for exact arithmetic with zero floating-point corruption. Capital conservation is enforced as an invariant: `available + locked + settled = total` at every state transition.

Settlement finalization is deliberately split from the reducer itself: a milestone is only ever marked `settled` after a **genuinely confirmed on-chain transaction receipt**. If a blockchain submission fails or can't be confirmed, the milestone stays claimed-but-unsettled and retryable — the system never reports a settlement that didn't actually happen.

## Core Features

- **Capital Treasury** — Deposit, track, and allocate construction capital with real-time KPIs (available, locked, settled, and a live on-chain wallet balance)
- **Dual Wallet Modes** — Demo Treasury Mode (no wallet required, judges/first-time users get a working experience instantly) or User Wallet Mode (connect MetaMask or WalletConnect, sign your own deposits, non-custodial)
- **On-Chain Deposits** — In User Wallet Mode, deposits are real signed USDC transfers, verified against the Arc Testnet chain before being credited — ConstructOS never trusts a client-reported amount
- **Project Portfolio** — Create projects with milestone-based budgets, assign contractors, and track lifecycle (draft → active → completed); delete projects or contractors that have no funded work in progress
- **Milestone Lifecycle** — Fund → Claim → Settle pipeline per milestone with full state machine enforcement
- **Real Blockchain Settlement** — Milestone payouts submit genuine transactions to Arc Testnet (native USDC transfer by default, cheaper than an ERC-20 call) and only mark a milestone settled once that transaction is confirmed on-chain
- **Risk Intelligence** — Multi-factor risk scoring (schedule, liquidity, funding, contractor) with portfolio-wide analysis
- **Capital Allocation** — Priority-ranked funding recommendations based on risk scores and available capital
- **Cash Flow Forecasting** — Linear-extrapolation project completion and cash flow projections
- **Ledger System** — Immutable, append-only event log with on-chain settlement proof (real `txHash`, `blockNumber`, `gasUsed` per settlement)
- **Multi-Tenant Architecture** — Organization-scoped state with API key authentication (registry included — see `src/multi-tenant.ts`)

## On-Chain Verification

ConstructOS settles on **Arc Testnet**. Anything the app reports as "settled" or "deposited" can be independently verified without trusting the app itself:

| Parameter | Value |
|---|---|
| Chain ID | `5042002` |
| RPC (HTTPS) | `https://rpc.testnet.arc.network` |
| Block Explorer | `https://testnet.arcscan.app` |
| USDC Contract (ERC-20 interface) | `0x3600000000000000000000000000000000000000` |

Every settlement's ledger entry includes a real `txHash` — paste it into the explorer above to confirm the transaction independently.

Two small verification scripts are included for exactly this purpose:
```bash
node scripts/check-balance.mjs 0xAnyAddress      # live on-chain USDC balance
node scripts/check-tx.mjs 0xTransactionHash      # confirm a specific settlement/deposit
```

## Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                         ConstructOS Monorepo                          │
│                                                                       │
│  ┌───────────────────┐          ┌──────────────────────────────┐    │
│  │   Backend (src/)   │          │      Frontend (frontend/)     │    │
│  │                    │          │                                │    │
│  │  ┌──────────────┐  │  HTTP    │  ┌──────────────────────┐     │    │
│  │  │  server.ts   │◄─┼──────────┼──┤   Vite Dev Server     │     │    │
│  │  │ (orchestrates│  │          │  └──────────┬────────────┘     │    │
│  │  │  chain calls)│  │          │             │                  │    │
│  │  └──────┬───────┘  │          │  ┌──────────▼────────────┐     │    │
│  │         │          │          │  │  lib/api.ts, web3.ts  │     │    │
│  │  ┌──────▼───────┐  │          │  │  (HTTP + wagmi/viem)  │     │    │
│  │  │   api.ts     │  │          │  └──────────┬────────────┘     │    │
│  │  │ (validation  │  │          │             │                  │    │
│  │  │  only for    │  │          │  ┌──────────▼────────────┐     │    │
│  │  │  settlement) │  │          │  │     React Pages        │     │    │
│  │  └──────┬───────┘  │          │  │ (visualization layer   │     │    │
│  │         │          │          │  │  + wallet connection)  │     │    │
│  │  ┌──────▼───────┐  │          │  └────────────────────────┘     │    │
│  │  │  engine.ts   │  │          │                                │    │
│  │  │  (reducer)   │  │          │  ┌────────────────────────┐     │    │
│  │  └──────┬───────┘  │          │  │     Design System      │     │    │
│  │         │          │          │  │    (Tailwind CSS)      │     │    │
│  │  ┌──────▼───────┐  │          │  └────────────────────────┘     │    │
│  │  │ economy.ts   │  │          └──────────────────────────────┘    │
│  │  │ ledger.ts    │  │                                               │
│  │  │ risk.ts      │  │          ┌──────────────────────────────┐    │
│  │  │ forecast.ts  │  │          │   Arc Testnet (real chain)    │    │
│  │  │ allocation   │  │◄─────────┤   settlement-arc.ts submits   │    │
│  │  └──────────────┘  │  submit  │   + verifies real txns        │    │
│  │                    │  &verify │                                │    │
│  │  ┌──────────────┐  │          └──────────────────────────────┘    │
│  │  │  store.ts    │  │  ← JSON file persistence                     │
│  │  └──────────────┘  │                                               │
│  └────────────────────┘                                               │
└───────────────────────────────────────────────────────────────────────┘
```

Note the split responsibility: `engine.ts` remains a pure, side-effect-free reducer.
`server.ts` is the only place that talks to the blockchain — it submits settlements/
verifies deposits via `settlement-arc.ts`, and only dispatches the reducer's
`CONFIRM_SETTLEMENT` command once it has a real confirmed receipt in hand.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend Runtime** | Node.js + TypeScript (executed via tsx) |
| **Backend Framework** | Raw http module — zero framework dependencies |
| **State Management** | Pure reducer pattern with immutable state transitions |
| **Financial Arithmetic** | Native BigInt — exact integer math, no floating point |
| **Persistence** | JSON file store (atomic write with temp file + rename); PostgreSQL migration scaffold exists in `src/db/` but is not yet wired up |
| **Blockchain Settlement** | Real Arc Testnet transactions via `viem` (native USDC transfer by default); falls back to a mock receipt only when `ARC_MODE` is unset or explicitly `mock` |
| **Wallet Connectivity** | `wagmi` + `viem`, MetaMask (injected) and WalletConnect (optional, requires a Project ID) |
| **Frontend Framework** | React 18 with lazy-loaded pages |
| **Build Tool** | Vite 5 with HMR and code splitting |
| **Styling** | Tailwind CSS 3.4 with strict design token system |
| **Icons** | Lucide React |
| **Type Safety** | TypeScript 5.3+ (strict mode) on both packages |

## Repository Layout

```
construct-os/
├── src/                          # CFEL Backend
│   ├── server.ts                 # HTTP server + blockchain orchestration (port 3001)
│   ├── api.ts                    # REST API route handler — pure, synchronous, no I/O
│   ├── engine.ts                 # Pure reducer: dispatch(command) → new state
│   ├── economy.ts                # Capital model + conservation invariant
│   ├── execution.ts              # Project/Contractor/Milestone domain types
│   ├── ledger.ts                 # Immutable append-only event log
│   ├── events.ts                 # Event bus (publish/subscribe)
│   ├── risk.ts                   # Multi-factor risk scoring
│   ├── forecast.ts                # Cash flow + completion forecasting
│   ├── allocation.ts             # Priority-ranked capital allocation
│   ├── settlement.ts             # Settlement adapter interface
│   ├── settlement-arc.ts         # Real Arc Testnet settlement + deposit verification
│   ├── demo-data.ts              # Seed data for the demo workspace
│   ├── store.ts                  # JSON file + in-memory state stores
│   ├── serialize.ts              # BigInt ↔ JSON serialization
│   ├── multi-tenant.ts           # Multi-tenant org registry
│   ├── index.ts                  # Barrel export
│   └── db/                       # PostgreSQL migration (not yet active)
│       ├── client.ts
│       └── migrations/
├── frontend/                     # React + Vite Frontend
│   ├── src/
│   │   ├── main.tsx              # App bootstrap (wagmi + wallet mode providers)
│   │   ├── App.tsx               # Page routing (state-based, lazy-loaded)
│   │   ├── vite-env.d.ts         # Vite env-var type declarations
│   │   ├── index.css             # Design system + component classes
│   │   ├── pages/                # Lazy-loaded page components
│   │   ├── components/
│   │   │   ├── layout/           # AppShell, Sidebar, TopBar, NavigationItem
│   │   │   ├── ui/                # Design-system primitives
│   │   │   ├── wallet/           # ConnectWalletButton, ConnectWalletModal
│   │   │   ├── dashboard/        # Dashboard domain components
│   │   │   ├── treasury/         # Treasury domain components
│   │   │   ├── portfolio/        # Portfolio domain components
│   │   │   ├── contractors/      # Contractor domain components
│   │   │   ├── ledger/           # Ledger domain components
│   │   │   ├── project/          # Project detail components
│   │   │   └── intelligence/     # Intelligence & analytics components
│   │   ├── lib/                  # API client, wagmi/web3 config, wallet mode context, hooks
│   │   └── types/                # TypeScript interfaces
│   ├── tailwind.config.js        # Design token definitions
│   ├── vite.config.ts            # Dev server + API proxy
│   └── package.json
├── test/                         # Backend tests
│   ├── engine.test.ts
│   └── api.test.ts
├── scripts/                      # Standalone chain-verification utilities
│   ├── check-balance.mjs
│   └── check-tx.mjs
├── data/                         # Runtime state persistence
│   └── constructos.json
├── docs/                         # Documentation
├── submission/                   # Hackathon submission assets
├── package.json                  # Backend dependencies
├── tsconfig.json                 # Backend TypeScript config
├── .env.example                  # Environment variable template
├── .gitignore
├── CHANGELOG.md
├── LICENSE
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+
- npm 9+
- (Optional, for real settlement) An Arc Testnet wallet funded with testnet USDC via the Circle faucet

### Backend

```bash
# Install backend dependencies
npm install

# Copy and fill in environment variables — see .env.example
cp .env.example .env

# Start the backend server (port 3001)
npm run dev
```

Set `ARC_MODE=real` and a funded `TREASURY_PRIVATE_KEY` in `.env` for genuine on-chain
settlement; omit or set `ARC_MODE=mock` to run entirely offline with simulated receipts.

### Frontend

```bash
cd frontend

# Install frontend dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env   # set VITE_TREASURY_ADDRESS to match your backend's treasury wallet

# Start the dev server (port 5173) with API proxy to backend
npm run dev
```

Open `http://localhost:5173` in your browser. The Vite dev server proxies all `/api/*` requests to the backend at `http://localhost:3001`.

## Development Workflow

```bash
# Start both backend and frontend concurrently
npm run dev:all

# Run backend tests
npm test

# Type-check backend
npm run typecheck

# Type-check frontend
cd frontend && npx tsc --noEmit

# Build frontend for production
cd frontend && npm run build
```

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check + version |
| GET | `/economy` | Capital treasury overview |
| POST | `/economy/deposit-onchain` | Deposit capital (verified against a real on-chain transaction — User Wallet Mode) |
| GET | `/projects` | List all projects |
| POST | `/projects` | Create a new project |
| GET | `/projects/:id` | Get project details |
| DELETE | `/projects/:id` | Delete a project (blocked if any milestone is funded) |
| POST | `/projects/:id/milestones/fund` | Fund a milestone |
| POST | `/projects/:id/milestones/claim` | Claim a milestone |
| POST | `/projects/:id/complete` | Validate + submit eligible milestones for real on-chain settlement |
| GET | `/projects/:id/ledger` | Project ledger events |
| GET | `/projects/:id/risk` | Project risk scores |
| GET | `/projects/:id/forecast` | Project completion forecast |
| GET | `/contractors` | List all contractors |
| POST | `/contractors` | Register a contractor |
| GET | `/contractors/:id` | Get contractor details |
| DELETE | `/contractors/:id` | Delete a contractor (blocked if they have any funded milestone) |
| GET | `/contractors/:id/ledger` | Contractor ledger events |
| GET | `/system/risk` | All project risk scores |
| GET | `/system/forecast` | Cash flow forecast |
| GET | `/system/allocations` | Capital allocation recommendations |
| POST | `/system/reset-demo` | Reset to the seeded demo workspace |

See [`docs/API.md`](docs/API.md) for detailed request/response schemas.

## Roadmap

- [ ] PostgreSQL persistence (migration scaffold exists, not yet wired up)
- [ ] Authentication layer
- [ ] WebSocket real-time updates
- [ ] Export to Excel/PDF reports
- [ ] Multi-tenant SaaS deployment
- [ ] Mobile-responsive optimizations

## License

MIT — see [LICENSE](LICENSE)

## Contributing

See [`docs/DeveloperGuide.md`](docs/DeveloperGuide.md) for contribution guidelines, architecture patterns, and coding conventions.

## Author

Built with CFEL Architecture — a deterministic, event-sourced financial operating system for construction, with real settlement on Arc Testnet.

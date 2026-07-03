# ConstructOS

**Construction Financial Operating System** — A deterministic, event-sourced financial engine for construction project capital management, built on the CFEL (Construction Finance Economic Layer) architecture.

## The Problem

Construction projects manage millions in capital across dozens of milestones, contractors, and payment cycles. Traditional financial systems treat construction funds as generic accounting entries, losing critical context: which milestone is funded, which contractor is assigned, what capital is locked versus available, and when settlements actually occur on-chain. This creates funding bottlenecks, settlement delays, audit nightmares, and zero real-time visibility into capital flow.

## Why CFEL Exists

CFEL (Construction Finance Economic Layer) is a purpose-built financial operating system that models construction economics as a **pure reducer** over an immutable event stream. Every financial operation — deposits, milestone funding, contractor claims, settlements — is a **command dispatched to a deterministic reducer** that produces a new state and appends immutable ledger events. All monetary values use **BigInt** for exact arithmetic with zero floating-point corruption. Capital conservation is enforced as an invariant: `available + locked + settled = total` at every state transition.

## Core Features

- **Capital Treasury** — Deposit, track, and allocate construction capital with real-time KPIs (total, available, locked, settled)
- **Project Portfolio** — Create projects with milestone-based budgets, assign contractors, and track lifecycle (draft → active → completed)
- **Milestone Lifecycle** — Fund → Claim → Settle pipeline per milestone with full state machine enforcement
- **Risk Intelligence** — Multi-factor risk scoring (schedule, liquidity, funding, contractor) with portfolio-wide analysis
- **Capital Allocation** — Priority-ranked funding recommendations based on risk scores and available capital
- **Cash Flow Forecasting** — Linear-extrapolation project completion and cash flow projections
- **Ledger System** — Immutable, append-only event log with on-chain settlement proof (Arc blockchain)
- **Multi-Tenant Architecture** — Organization-scoped state with API key authentication (registry included)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ConstructOS Monorepo                     │
│                                                             │
│  ┌──────────────────┐       ┌──────────────────────────┐   │
│  │   Backend (src/)  │       │   Frontend (frontend/)   │   │
│  │                  │       │                          │   │
│  │  ┌────────────┐  │ HTTP  │  ┌──────────────────┐   │   │
│  │  │ server.ts  │◄─┼───────┼──┤  Vite Dev Server  │   │   │
│  │  └─────┬──────┘  │       │  └────────┬─────────┘   │   │
│  │        │         │       │           │             │   │
│  │  ┌─────▼──────┐  │       │  ┌────────▼─────────┐   │   │
│  │  │  api.ts    │  │       │  │  lib/api.ts      │   │   │
│  │  └─────┬──────┘  │       │  └────────┬─────────┘   │   │
│  │        │         │       │           │             │   │
│  │  ┌─────▼──────┐  │       │  ┌────────▼─────────┐   │   │
│  │  │ engine.ts  │  │       │  │  React Pages     │   │   │
│  │  │ (reducer)  │  │       │  │  (visualization  │   │   │
│  │  └─────┬──────┘  │       │  │   layer only)    │   │   │
│  │        │         │       │  └──────────────────┘   │   │
│  │  ┌─────▼──────┐  │       │                          │   │
│  │  │ economy.ts │  │       │  ┌──────────────────┐   │   │
│  │  │ ledger.ts  │  │       │  │  Design System   │   │   │
│  │  │ risk.ts    │  │       │  │  (Tailwind CSS)  │   │   │
│  │  │ forecast.ts│  │       │  └──────────────────┘   │   │
│  │  │ allocation │  │       │                          │   │
│  │  └────────────┘  │       └──────────────────────────┘   │
│  │                  │                                       │
│  │  ┌────────────┐  │                                       │
│  │  │  store.ts  │  │  ← JSON file persistence              │
│  │  └────────────┘  │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend Runtime** | Node.js + TypeScript (executed via tsx) |
| **Backend Framework** | Raw http module — zero framework dependencies |
| **State Management** | Pure reducer pattern with immutable state transitions |
| **Financial Arithmetic** | Native BigInt — exact integer math, no floating point |
| **Persistence** | JSON file store (atomic write with temp file + rename) |
| **Blockchain Settlement** | Arc blockchain adapter (simulated) |
| **Frontend Framework** | React 18 with lazy-loaded pages |
| **Build Tool** | Vite 5 with HMR and code splitting |
| **Styling** | Tailwind CSS 3.4 with strict design token system |
| **Icons** | Lucide React |
| **Type Safety** | TypeScript 5.3+ (strict mode) on both packages |

## Repository Layout

```
construct-os/
├── src/                          # CFEL Backend
│   ├── server.ts                 # HTTP server entry point (port 3001)
│   ├── api.ts                    # REST API route handler (13 endpoints)
│   ├── engine.ts                 # Pure reducer: dispatch(command) → new state
│   ├── economy.ts                # Capital model + conservation invariant
│   ├── execution.ts              # Project/Contractor/Milestone domain types
│   ├── ledger.ts                 # Immutable append-only event log
│   ├── events.ts                 # Event bus (publish/subscribe)
│   ├── risk.ts                   # Multi-factor risk scoring
│   ├── forecast.ts               # Cash flow + completion forecasting
│   ├── allocation.ts             # Priority-ranked capital allocation
│   ├── settlement.ts             # Settlement adapter interface
│   ├── settlement-arc.ts         # Arc blockchain settlement adapter
│   ├── store.ts                  # JSON file + in-memory state stores
│   ├── serialize.ts              # BigInt ↔ JSON serialization
│   ├── multi-tenant.ts           # Multi-tenant org registry
│   ├── index.ts                  # Barrel export
│   └── db/                       # PostgreSQL migration (future)
│       ├── client.ts
│       └── migrations/
├── frontend/                     # React + Vite Frontend
│   ├── src/
│   │   ├── main.tsx              # App bootstrap
│   │   ├── App.tsx               # Page routing (state-based, lazy-loaded)
│   │   ├── index.css             # Design system + component classes
│   │   ├── pages/                # 10 lazy-loaded page components
│   │   ├── components/
│   │   │   ├── layout/           # AppShell, Sidebar, TopBar, NavigationItem
│   │   │   ├── ui/               # 19 design-system primitives
│   │   │   ├── dashboard/        # Dashboard domain components
│   │   │   ├── treasury/         # Treasury domain components
│   │   │   ├── portfolio/        # Portfolio domain components
│   │   │   ├── contractors/      # Contractor domain components
│   │   │   ├── ledger/           # Ledger domain components
│   │   │   ├── project/          # Project detail components
│   │   │   └── intelligence/     # Intelligence & analytics components
│   │   ├── lib/                  # API client, custom hooks
│   │   └── types/                # TypeScript interfaces
│   ├── tailwind.config.js        # Design token definitions
│   ├── vite.config.ts            # Dev server + API proxy
│   └── package.json
├── test/                         # Backend tests
│   ├── engine.test.ts
│   └── api.test.ts
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

### Backend

```bash
# Install backend dependencies
npm install

# Start the backend server (port 3001)
npm run dev
```

### Frontend

```bash
cd frontend

# Install frontend dependencies
npm install

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

# Build frontend for production
cd frontend && npm run build
```

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check + version |
| GET | `/economy` | Capital treasury overview |
| POST | `/economy/deposit` | Deposit capital |
| GET | `/projects` | List all projects |
| POST | `/projects` | Create a new project |
| GET | `/projects/:id` | Get project details |
| POST | `/projects/:id/milestones/fund` | Fund a milestone |
| POST | `/projects/:id/milestones/claim` | Claim a milestone |
| POST | `/projects/:id/complete` | Complete project (settle claimed milestones) |
| GET | `/projects/:id/ledger` | Project ledger events |
| GET | `/projects/:id/risk` | Project risk scores |
| GET | `/projects/:id/forecast` | Project completion forecast |
| GET | `/contractors` | List all contractors |
| POST | `/contractors` | Register a contractor |
| GET | `/contractors/:id` | Get contractor details |
| GET | `/contractors/:id/ledger` | Contractor ledger events |
| GET | `/system/risk` | All project risk scores |
| GET | `/system/forecast` | Cash flow forecast |
| GET | `/system/allocations` | Capital allocation recommendations |

See [`docs/API.md`](docs/API.md) for detailed request/response schemas.

## Roadmap

- [ ] PostgreSQL persistence (migration scaffold exists)
- [ ] URL-based routing with React Router
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

Built with CFEL Architecture — a deterministic, event-sourced financial operating system for construction.
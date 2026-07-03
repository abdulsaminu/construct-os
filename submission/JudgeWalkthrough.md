# Judge Walkthrough — ConstructOS

## What to Look For

### 1. Open the Repository

Start with the README. It contains:
- Architecture diagram showing the CFEL pattern
- Technology stack table
- Repository layout with every file explained
- Installation instructions (two commands: `npm install` in each package)

### 2. Examine the Backend (`src/`)

**Start with `src/engine.ts`** — This is the heart of the system:
- The `dispatch()` function is a pure reducer: `(state, command) → { success, state, events }` or `{ success, error }`
- 6 command types handle the entire financial lifecycle
- Every state transition produces immutable copies (spread operators, never mutation)
- `assertConservation()` runs after every dispatch to enforce the capital invariant

**Then look at `src/economy.ts`** — 15 lines that define the capital model:
- `totalCapital`, `lockedCapital`, `settledCapital` are all `bigint`
- `getAvailableCapital()` is a derived value: `total - locked - settled`
- `assertConservation()` throws if the invariant is violated

**Check `src/serialize.ts`** — BigInt-safe JSON serialization:
- Uses `{ __bi: "value" }` tagging to prevent numeric string corruption
- Recursive serialization/deserialization handles nested objects

**Review `src/api.ts`** — 18 endpoints in ~110 lines:
- Simple path matching, no framework
- Every POST dispatches a command to the reducer
- BigInt values are stringified for JSON transport

### 3. Examine the Frontend (`frontend/src/`)

**Look at `lib/api.ts`** — Typed HTTP client:
- `fetcher<T>(url)` and `poster<T>(url, body)` — generic typed wrappers
- `money(value)` — `Intl.NumberFormat` USD formatter
- Frontend never does math on financial values

**Check `App.tsx`** — State-based routing:
- All pages are `React.lazy()` loaded
- Navigation is via `setPage()` state
- `Suspense` with skeleton fallbacks

**Look at any page** (e.g., `pages/DashboardPage.tsx`):
- Fetches data in `useEffect` with typed API calls
- Passes data to domain components
- Zero financial computation

**Examine `components/ui/`** — 19 design primitives:
- `Panel`, `MetricCard`, `Table`, `Drawer`, `Badge`, `Toast`, `Select` (with keyboard nav)
- All use semantic design tokens from `tailwind.config.js`

### 4. Review the Design System

**Open `frontend/tailwind.config.js`**:
- 11 typography levels (display-lg through micro)
- 4 semantic shadow levels (surface, raised, floating, overlay)
- 4 semantic border-radius aliases (btn, input, card, dialog, badge)
- 3 animation duration tokens (fast 150ms, normal 250ms, slow 350ms)

**Open `frontend/src/index.css`**:
- WCAG AA focus-visible outlines
- Reduced motion media query
- Component-layer classes (btn-primary, form-input, card-interactive)

### 5. Check the Tests

**Open `test/engine.test.ts`**:
- Tests the reducer directly — no HTTP server needed
- Tests capital conservation invariant
- Tests error cases (insufficient funds, already funded, etc.)

### 6. Run It

```bash
# Backend
npm install && npm run dev

# Frontend (another terminal)
cd frontend && npm install && npm run dev
```

Open `http://localhost:5173`.

### 7. Try the Full Lifecycle

1. **Dashboard** — See the capital overview
2. **Treasury → Deposit** — Add capital
3. **Portfolio → New Project** — Create with milestones
4. **Project Detail → Fund** — Fund a milestone (watch capital move from available to locked)
5. **Project Detail → Claim** — Contractor claims work
6. **Project Detail → Complete** — Triggers blockchain settlement with TX hashes
7. **Ledger** — See the immutable event log with on-chain proof
8. **Intelligence → Risk** — Multi-factor risk scoring
9. **Intelligence → Forecasts** — Cash flow projections

## What Makes This Different

1. **Deterministic financial engine**: Same inputs always produce same outputs. No hidden state, no database triggers, no framework magic.
2. **BigInt arithmetic**: Construction deals with millions. Floating point would corrupt values at this scale. We use native BigInt for exact arithmetic.
3. **Capital conservation invariant**: Mathematically enforced at every state transition. Impossible to create or destroy money.
4. **Blockchain settlement**: Real transaction hashes, block numbers, and gas usage from the Arc blockchain.
5. **Visualization-only frontend**: The frontend is a rendering layer. All business logic, financial calculations, and state management live in the backend reducer.
6. **Zero framework backend**: The entire API server is ~40 lines of Node's `http` module. No Express, no Fastify, no Koa.

## Common Questions

**Q: Why not use Express?**
A: The API is 18 endpoints with simple path matching. A framework adds overhead without benefit here. The reducer is the interesting part, not the HTTP layer.

**Q: Why BigInt instead of a decimal library?**
A: Construction budgets are in whole currency units (cents are not tracked at this level). BigInt provides exact integer arithmetic with zero dependencies and native runtime performance.

**Q: Why not use a database?**
A: The current `JsonFileStore` with atomic writes (temp file + rename) is sufficient for the demo. The architecture supports swapping to any store via the `StateStore` interface. A PostgreSQL migration scaffold exists in `src/db/`.

**Q: Is the frontend doing any financial calculations?**
A: No. All monetary values are pre-formatted strings from the API. The frontend only calls `Intl.NumberFormat` for display formatting.
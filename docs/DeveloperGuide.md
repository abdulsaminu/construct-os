# Developer Guide

## Folder Structure

```
construct-os/
├── src/                    # Backend — CFEL engine + HTTP server
│   ├── engine.ts           # THE core: pure reducer (dispatch function)
│   ├── api.ts              # HTTP route handler — maps paths to reducer commands
│   ├── server.ts           # Node http server entry point
│   ├── economy.ts          # Capital pool types + conservation invariant
│   ├── execution.ts        # Project, Milestone, Contractor domain types + factories
│   ├── ledger.ts           # LedgerEntry type + filter functions
│   ├── events.ts           # EventBus (pub/sub) for side effects
│   ├── risk.ts             # Multi-factor risk scoring
│   ├── forecast.ts         # Cash flow + completion forecasting
│   ├── allocation.ts       # Priority-ranked capital allocation
│   ├── settlement.ts       # SettlementAdapter interface
│   ├── settlement-arc.ts   # Arc blockchain implementation
│   ├── store.ts            # JsonFileStore + InMemoryStore
│   ├── serialize.ts        # BigInt ↔ JSON safe serialization
│   ├── multi-tenant.ts     # Multi-tenant org registry
│   ├── index.ts            # Barrel re-exports
│   └── db/                 # PostgreSQL (future)
├── frontend/
│   └── src/
│       ├── App.tsx         # Page router (state-based, lazy-loaded)
│       ├── pages/          # One file per page — fetches data, renders components
│       ├── components/
│       │   ├── ui/         # 19 reusable primitives (Panel, Badge, Table, etc.)
│       │   ├── layout/     # AppShell, Sidebar, TopBar, NavigationItem
│       │   └── [domain]/   # Domain components grouped by feature
│       ├── lib/
│       │   └── api.ts      # fetcher<T>, poster<T>, money() — typed HTTP helpers
│       ├── types/
│       │   └── index.ts    # All TypeScript interfaces
│       └── index.css       # Tailwind + component layer CSS
├── test/                   # Backend unit tests
└── data/                   # Runtime JSON state file
```

## Coding Conventions

### Backend

- **All monetary values are `bigint`**. Never use `number` for money. The API layer serializes to strings.
- **The reducer must be pure**. No side effects, no I/O, no random numbers. `dispatch()` takes state + command, returns new state + events.
- **Immutable updates only**. Always spread objects and arrays: `{ ...state, projects: [...state.projects] }`.
- **Capital conservation is sacred**. After every dispatch, `assertConservation()` runs. If it throws, the command is rejected.
- **Use `crypto.randomUUID()`** for all IDs (project, milestone, contractor, ledger entry).
- **Event types are literal unions**: `"CAPITAL_DEPOSIT" | "MILESTONE_FUNDED" | "MILESTONE_CLAIMED" | "SETTLEMENT"`.

### Frontend

- **Frontend is visualization-only**. Never compute financial values. Display pre-formatted strings from the API.
- **Use design tokens** from `tailwind.config.js`. Never use raw pixel values, default Tailwind text sizes (`text-sm`, `text-base`), or arbitrary hex colors.
- **All amounts are `string`** in the TypeScript types. Format with `money()` from `lib/api.ts`.
- **Pages are lazy-loaded** with `React.lazy()` and wrapped in `<Suspense>`.
- **Use semantic HTML**: `<th scope="col">`, `role="progressbar"`, `aria-label` on icon buttons, `role="alert"` for toasts.
- **Component composition**: UI primitives → domain components → pages. Never skip layers.

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

3. **Add the API route** in `src/api.ts`:
   ```ts
   if (method === 'POST' && /* path match */) {
     const result = dispatch(state, { type: 'YOUR_COMMAND', payload: { /* ... */ } });
     if (!result.success) return { statusCode: 400, body: { error: result.error } };
     return { statusCode: 200, body: /* response */, newState: result.state };
   }
   ```

4. **Add tests** in `test/engine.test.ts`:
   ```ts
   it('handles YOUR_COMMAND', () => {
     const result = dispatch(state, { type: 'YOUR_COMMAND', payload: { ... } });
     assert(result.success);
     // assert new state shape
   });
   ```

## API Conventions

- **GET requests** are read-only projections. They never modify state.
- **POST requests** dispatch commands to the reducer. They return the new state portion + status code 200/201, or error with 400.
- **BigInt serialization**: The server uses `JSON.stringify` with a replacer that converts `bigint` to `string`. The frontend receives all monetary values as strings.
- **CORS**: Enabled for all origins (`Access-Control-Allow-Origin: *`).
- **No authentication**: Currently open. Multi-tenant infrastructure exists but is not wired into the HTTP layer.

## Testing

Run tests with `npm test` from the repository root. Tests use Node's built-in test runner via `tsx --test`. The test files in `test/` import the reducer and API handler directly — no HTTP server needed for unit tests.
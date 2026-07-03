# Demo Script — ConstructOS

## Setup (30 seconds)

```bash
# Terminal 1: Start backend
npm run dev
# Output: "ConstructOS v0.3.0 (Arc Settlement Active) — Listening on http://localhost:3001"

# Terminal 2: Start frontend
cd frontend && npm run dev
# Output: "Local: http://localhost:5173"
```

Open `http://localhost:5173` in browser.

---

## Demo Flow (5 minutes)

### 1. Dashboard Overview (30 seconds)

**Say:** "This is the ConstructOS command center. At a glance, I can see our total capital pool — $500M available, with $150M locked in active milestones and $50M already settled to contractors. Below that, the portfolio panel shows all active projects with their risk scores, and the command center tells me exactly what actions need my attention right now."

**Show:**
- KPI cards (Total Capital, Available, Locked, Settled)
- Portfolio panel with risk badges
- Command Center actionable items
- Risk Monitor with composite scores

### 2. Deposit Capital (30 seconds)

**Navigate:** Click "Treasury" in sidebar

**Say:** "Let's deposit additional capital into the treasury. I'll add $100M."

**Show:**
- Click deposit button
- Enter amount: 100000000000
- Submit
- Watch KPIs update in real-time

### 3. Create a Project (60 seconds)

**Navigate:** Click "Portfolio" → "New Project"

**Say:** "Now let's create a construction project. I'll define a highway bridge repair with three milestones, each with a specific budget that sums to the total."

**Show:**
- Step 1: Enter project name "Highway Bridge Phase 2", total budget $200M
- Step 2: Define 3 milestones (Site Prep $50M, Structural Work $100M, Finishing $50M)
- Step 3: Review and create
- Project appears in portfolio with risk badge

### 4. Fund a Milestone (45 seconds)

**Navigate:** Click the new project card

**Say:** "Inside the project detail, I can see each milestone as an accordion. Let's fund the first milestone — this locks $50M from available capital and moves it to the locked pool."

**Show:**
- Expand first milestone
- Click "Fund"
- Watch the milestone status change from unfunded to funded
- Note the project status remains "draft" (needs all milestones funded to become active)
- Fund remaining milestones
- Project status changes to "active"

### 5. View Risk Intelligence (45 seconds)

**Navigate:** Click "Intelligence" in sidebar → "Risk" tab

**Say:** "The risk engine scores every project across four dimensions — schedule risk based on funding progress, liquidity risk based on capital concentration, funding risk for remaining milestones, and contractor risk for unassigned budget. The composite score is a weighted average. I can expand any project to see the per-factor breakdown."

**Show:**
- Risk matrix table
- Expand a project's risk breakdown panel
- Show the five risk factor bars

### 6. Complete Project & Blockchain Settlement (60 seconds)

**Navigate:** Back to project detail → claim all milestones → complete

**Say:** "Once the contractor has completed their work, they claim each milestone. Then I complete the project, which triggers settlement — moving capital from locked to settled, and submitting the payments to the Arc blockchain for immutable proof."

**Show:**
- Claim a milestone (contractor claims completed work)
- Click "Complete Project"
- Wait 1.5 seconds for blockchain confirmation
- View the settlement entries in the ledger with TX hashes
- Click a TX hash link to view on Arbiscan (or show the blockchain metadata drawer)

### 7. Cash Flow Forecast (30 seconds)

**Navigate:** Intelligence → "Forecasts" tab

**Say:** "The forecasting module projects our cash flow over the next 90 days, showing how available, locked, and settled capital will evolve. Each project gets a confidence score based on its current progress rate."

**Show:**
- Stacked bar cash flow chart
- Project forecast cards with CircularGauge confidence scores
- Settlement forecast section

### 8. System Health (15 seconds)

**Navigate:** Intelligence → "System Health" tab

**Say:** "Finally, the system health page monitors all subsystems — API gateway, ledger, settlement engine, risk engine, forecast service, and storage — all derived from real operational metrics, not hardcoded values."

**Show:**
- 4 KPI metric cards
- Service status grid with health indicators

---

## Key Talking Points

- **"Every dollar is tracked"** — The capital conservation invariant means money can never be created or destroyed
- **"Zero floating point"** — BigInt arithmetic means no rounding errors, ever
- **"Immutable audit trail"** — Every operation is a ledger event that can never be modified
- **"Blockchain proof"** — Settlements produce on-chain transaction hashes for regulatory compliance
- **"Pure function backend"** — The entire financial engine is a single deterministic reducer, testable without any infrastructure
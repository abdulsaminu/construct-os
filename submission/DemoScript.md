# Demo Script — ConstructOS

## Before You Start

Confirm your `.env` has `ARC_MODE=real` and a funded `TREASURY_PRIVATE_KEY` on Arc Testnet
(chain ID `5042002`). Check your treasury balance beforehand:

```bash
node scripts/check-balance.mjs 0xYourTreasuryAddress
```

You want a small buffer above whatever you plan to demo (a few USDC is plenty — this demo
uses whole-dollar amounts like `$10`–`$50`, not millions).

## Setup (30 seconds)

```bash
# Terminal 1: Start backend
npm run dev
# Output: "ConstructOS v0.4.0 (Demo Ready)"
#         "Listening on http://localhost:3001"
#         "Arc Mode: real"   <- confirm this says "real", not "mock", before demoing

# Terminal 2: Start frontend
cd frontend && npm run dev
# Output: "Local: http://localhost:5173"
```

Open `http://localhost:5173` in browser.

**If a judge wants to verify anything on-chain during the demo**, the explorer is:
`https://testnet.arcscan.app`

---

## Demo Flow (6–7 minutes)

### 1. Dashboard Overview (30 seconds)

**Say:** "This is the ConstructOS command center. At the top I can see our live wallet
balance — this is a real, on-chain USDC balance on Arc Testnet, not an internal number.
Below that, the portfolio panel shows active projects with risk scores, and the command
center highlights exactly what needs my attention right now."

**Show:**
- KPI cards (Wallet Balance — live on-chain, Available Liquidity, Locked Escrow, Settled On-Chain)
- Portfolio panel with risk badges
- Command Center actionable items
- Risk Monitor with composite scores

### 2. Connect a Wallet — the differentiator (45 seconds)

**Navigate:** Click the wallet button in the top bar

**Say:** "ConstructOS supports two modes. By default it runs in Demo Treasury Mode, so
judges without a wallet can try everything immediately. But it's built as a true Web3
app — I can connect my own MetaMask wallet instead, and from that point on, every deposit
I make is a real transaction I sign myself. ConstructOS never custodies my funds; it only
verifies my transaction on-chain before crediting it."

**Show:**
- Click "Connect Wallet" → modal shows MetaMask, WalletConnect, Demo Treasury Mode options
- Connect MetaMask (use a wallet already funded with a small amount of testnet USDC)
- Top bar now shows the connected address, live balance, and "Arc Testnet"

### 3. Deposit Capital — real on-chain transaction (45 seconds)

**Navigate:** Click "Treasury" in sidebar

**Say:** "Let's deposit into the treasury. I'll add 5 USDC."

**Show:**
- Enter amount: `5`
- Click Deposit
- MetaMask prompts to approve a real USDC transfer — approve it
- Button shows "Confirm in wallet..." then "Verifying on-chain..."
- Once confirmed, the Treasury dashboard updates with the new balance
- **Optional, for a skeptical judge:** open the resulting transaction on
  `testnet.arcscan.app` to show the deposit really happened, sender-to-treasury,
  independent of anything ConstructOS itself reports

### 4. Create a Project (60 seconds)

**Navigate:** Click "Portfolio" → "New Project"

**Say:** "Now let's create a construction project. I'll define a small renovation job with
three milestones, each with a budget that sums to the total. All amounts here are whole
USDC dollars."

**Show:**
- Step 1: Enter project name "Site Renovation — Block C", total budget `20`
- Step 2: Define milestones (Site Prep `8`, Structural Work `8`, Finishing `4`)
- Step 3: Review and create
- Project appears in portfolio with risk badge

### 5. Fund a Milestone (45 seconds)

**Navigate:** Click the new project card

**Say:** "Inside the project detail, each milestone is an accordion. Funding the first
milestone locks its budget from available capital into the locked pool."

**Show:**
- Expand first milestone
- Click "Fund"
- Watch the milestone status change from unfunded to funded
- Note the project status remains "draft" until all milestones are funded
- Fund remaining milestones
- Project status changes to "active"

### 6. View Risk Intelligence (45 seconds)

**Navigate:** Click "Intelligence" in sidebar → "Risk" tab

**Say:** "The risk engine scores every project across four dimensions — schedule risk based
on funding progress, liquidity risk based on capital concentration, funding risk for
remaining milestones, and contractor risk for unassigned budget. I can expand any project
to see the per-factor breakdown."

**Show:**
- Risk matrix table
- Expand a project's risk breakdown panel
- Show the risk factor bars

### 7. Complete Project & Real Blockchain Settlement (60–90 seconds)

**Navigate:** Back to project detail → claim milestone(s) → complete

**Say:** "Once the contractor claims their completed work, I complete the project. This
submits a real transaction to Arc Testnet — either a native USDC transfer or an ERC-20
transfer, straight from the treasury to the contractor's wallet. ConstructOS waits for the
transaction to actually confirm on-chain before marking anything settled. If confirmation
fails for any reason — network issue, whatever — the milestone stays unsettled and
retryable, rather than falsely showing as paid."

**Show:**
- Claim a milestone (contractor claims completed work)
- Click "Complete Project"
- Brief wait for real on-chain confirmation (Arc has sub-second deterministic finality once
  the transaction lands — total wait is typically just a few seconds end-to-end)
- View the settlement entry in the ledger — real `txHash`, `blockNumber`, `gasUsed`
- Click through to `testnet.arcscan.app` with that hash — show the real transaction,
  sender (treasury), recipient (contractor), amount

**Optional, if a judge asks about Circle:** This demo runs with `SETTLEMENT_MODE=arc`
(direct viem transfer). Restarting the backend with `SETTLEMENT_MODE=circle` routes the
exact same settlement flow through Circle's Developer-Controlled Wallets `createTransaction`
API instead - same reducer, same ledger, same UI, different signing path. Both are real,
independently verifiable on-chain transactions; `arc` is the default because it has the
longer track record in this project, not because `circle` is less reliable.

### 8. Cash Flow Forecast (30 seconds)

**Navigate:** Intelligence → "Forecasts" tab

**Say:** "The forecasting module projects cash flow over the next 90 days, showing how
available, locked, and settled capital will evolve. Each project gets a confidence score
based on its current progress rate."

**Show:**
- Stacked bar cash flow chart
- Project forecast cards with CircularGauge confidence scores
- Settlement forecast section

### 9. System Health (15 seconds)

**Navigate:** Intelligence → "System Health" tab

**Say:** "The system health page monitors all subsystems — API gateway, ledger, settlement
engine, risk engine, forecast service, and storage — all derived from real operational
metrics, not hardcoded values."

**Show:**
- KPI metric cards
- Service status grid with health indicators

---

## Key Talking Points

- **"Every dollar is tracked"** — The capital conservation invariant means money can never be created or destroyed
- **"Zero floating point"** — BigInt arithmetic means no rounding errors, ever
- **"Immutable audit trail"** — Every operation is a ledger event that can never be modified
- **"Real blockchain settlement, not simulated"** — Settlements are genuine Arc Testnet transactions, independently verifiable on `testnet.arcscan.app`
- **"Settlement is honest, not optimistic"** — A milestone only shows as settled after a confirmed on-chain receipt; failures are recorded and retryable, never silently faked
- **"Non-custodial by choice"** — Connect your own wallet and ConstructOS never touches your funds directly; it only verifies what you've already sent
- **"Pure function backend"** — The core financial engine is a single deterministic reducer, testable without any infrastructure

## If a Judge Asks...

**"Is this really on-chain, or simulated?"** — Show the live "Arc Mode: real" line from the
backend startup log, then click through any settlement's txHash to `testnet.arcscan.app`
to verify independently.

**"What happens if the blockchain transaction fails?"** — Point to the honest-failure
design: milestones stay unsettled and retryable rather than showing a fake success. This
is a deliberate design choice, not a gap — the system used to silently fall back to a fake
confirmation on error, and that was fixed specifically because it undermined the settlement
guarantee.

**"Can I fund this myself?"** — Yes — connect any MetaMask wallet with testnet USDC via
the wallet button, switch to User Wallet Mode, and deposit directly. The Circle faucet
provides testnet USDC for Arc.

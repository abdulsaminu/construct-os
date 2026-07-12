# API Reference

Base URL: `http://localhost:3001`

All responses are JSON. Monetary values are serialized as **whole-dollar strings**
(e.g., `"50"` means $50) — not minor units. This matters: the reducer and settlement
layer both treat every bigint amount as a whole USD/USDC dollar figure throughout,
converting to on-chain minor units (6 decimals) or native wei (18 decimals) only at
the point of an actual blockchain transaction. Earlier drafts of this document (and an
earlier version of the demo seed data) used inflated example numbers as if amounts were
already in minor units — corrected below.

---

## Health Check

### `GET /`

Returns the API status and version.

**Response** `200`
```json
{ "status": "ok", "version": "0.4.0" }
```

---

## Economy

### `GET /economy`

Returns the capital treasury overview.

**Response** `200`
```json
{
  "totalCapital": "100",
  "availableCapital": "60",
  "lockedCapital": "30",
  "settledCapital": "10"
}
```

### `POST /economy/deposit`

Deposit capital into the treasury via the trusted path (Demo Treasury Mode — no
on-chain verification, the amount is trusted as given).

**Request Body**
```json
{ "amount": "50" }
```

**Response** `200`
```json
{
  "totalCapital": "150",
  "lockedCapital": "30",
  "settledCapital": "10"
}
```

**Error** `400`
```json
{ "error": "Invalid amount" }
```

### `POST /economy/deposit-onchain`

Deposit capital via the verified path (User Wallet Mode). The caller supplies a real
transaction hash from a USDC transfer they signed themselves; the backend verifies —
via a real RPC call to Arc Testnet — that the transaction is confirmed, sent the
correct amount, went to the correct treasury address, and did **not** come from the
treasury address itself (self-deposits are rejected, since they represent no real new
capital). Only then is the deposit credited.

**Request Body**
```json
{
  "txHash": "0xabc123...",
  "amount": "20",
  "fromAddress": "0xYourWalletAddress"
}
```

**Response** `200` — same shape as `GET /economy`.

**Errors** `400`
- `"txHash and amount are required"`
- `"amount must be a whole number (USDC, no decimals)"`
- `"amount must be greater than zero"`
- `"No matching USDC transfer of {amount} to the treasury address found in this transaction"`
- `"Deposit rejected: sender is the treasury address itself. Deposits must come from an external wallet."`
- `"Transaction reverted on-chain"`

**Note:** this route is handled directly in `server.ts`, not `api.ts` — it needs a real
RPC call, and `api.ts`'s handler is intentionally kept pure and synchronous.

---

## Projects

### `GET /projects`

Returns all projects with milestones.

**Response** `200`
```json
[
  {
    "id": "uuid",
    "name": "Site Renovation — Block C",
    "totalBudget": "20",
    "status": "active",
    "createdAt": 1719897600000,
    "milestones": [
      {
        "id": "uuid",
        "name": "Site Preparation",
        "budget": "8",
        "funded": true,
        "claimed": false,
        "settled": false,
        "payeeId": "contractor-uuid"
      }
    ]
  }
]
```

### `POST /projects`

Create a new project.

**Request Body**
```json
{
  "name": "New Construction Project",
  "totalBudget": "20",
  "milestones": [
    { "name": "Phase 1", "budget": "10", "payeeId": "contractor-uuid" },
    { "name": "Phase 2", "budget": "10" }
  ]
}
```

**Response** `201` — Returns the created project (same shape as `GET /projects/:id`).

### `GET /projects/:id`

Returns a single project by ID.

**Response** `200` — Project object. **404** if not found.

### `DELETE /projects/:id`

Delete a project entirely.

**Response** `200`
```json
{ "message": "Project deleted successfully" }
```

**Error** `400`
```json
{ "error": "Cannot delete project with funded milestones. Settle or reverse funds first." }
```

### `POST /projects/:id/milestones/fund`

Fund a specific milestone. Locks the milestone's budget from available capital. Project becomes `active` when all milestones are funded.

**Request Body**
```json
{ "milestoneId": "milestone-uuid" }
```

**Response** `200` — Updated project object.

**Errors** `400`
- `"Project not found"`
- `"Milestone not found"`
- `"Milestone already funded"`
- `"Insufficient available capital. Required: ... | Available: ..."`
- `"Sequential funding violation: Fund \"X\" before funding \"Y\""`

### `POST /projects/:id/milestones/claim`

Claim a funded milestone. Only the assigned contractor can claim.

**Request Body**
```json
{ "milestoneId": "milestone-uuid", "contractorId": "contractor-uuid" }
```

**Response** `200` — Updated project object.

**Errors** `400`
- `"Milestone not funded yet"`
- `"Milestone already claimed"`
- `"Unauthorized: Only assigned contractor can claim"`
- `"Sequential claim violation: Complete \"X\" before claiming \"Y\""`

### `POST /projects/:id/complete`

Submits every claimed-but-unsettled milestone on the project for real on-chain
settlement. **This is a two-phase operation, not a single atomic transaction:**

1. The reducer validates there's at least one eligible milestone (returns `400` if not) — this step mutates nothing.
2. For each eligible milestone, the server submits a real transaction to Arc Testnet and waits for confirmation.
3. Each milestone that confirms is marked `settled` individually, with a real `txHash`/`blockNumber`/`gasUsed` recorded on its `SETTLEMENT` ledger entry.
4. Any milestone whose transaction fails or times out is **not** marked settled — instead a `SETTLEMENT_FAILED` ledger entry records why, and the milestone remains claimed-but-unsettled and eligible to retry by calling this endpoint again.
5. The project only reaches `status: "completed"` once *every* milestone on it is settled — a partial failure leaves the project `active` with a mix of settled and still-pending milestones.

**Request Body**: None.

**Response** `200` — The project object as it stands after all attempts (may be
`"completed"` or still `"active"` with some milestones settled and others pending retry):
```json
{
  "id": "uuid",
  "status": "completed",
  "milestones": [
    {
      "id": "uuid",
      "settled": true,
      "claimedAt": 1719897600000
    }
  ]
}
```

Check `GET /projects/:id/ledger` for the actual `SETTLEMENT`/`SETTLEMENT_FAILED` entries
with transaction details.

**Error** `400`
- `"No claimed milestones to settle. Contractor must claim work first."`

### `GET /projects/:id/ledger`

Returns ledger entries for a specific project.

**Response** `200` — Array of `LedgerEntry` objects. A confirmed settlement entry looks like:
```json
{
  "type": "SETTLEMENT",
  "amount": "10",
  "payeeId": "contractor-uuid",
  "milestoneId": "milestone-uuid",
  "metadata": {
    "contractorName": "Urban Builders Ltd",
    "txHash": "0x...",
    "blockNumber": 50825436,
    "gasUsed": "21000"
  }
}
```

### `GET /projects/:id/risk`

Returns multi-factor risk scores for a project.

**Response** `200`
```json
{
  "scheduleRisk": 60,
  "liquidityRisk": 25,
  "fundingRisk": 40,
  "contractorRisk": 50,
  "composite": 45
}
```

### `GET /projects/:id/forecast`

Returns completion forecast for a project.

**Response** `200`
```json
{
  "completionDays": 14,
  "confidence": 75,
  "reason": "Linear extrapolation"
}
```

---

## Contractors

### `GET /contractors`

Returns all registered contractors.

**Response** `200`
```json
[
  {
    "id": "uuid",
    "name": "Acme Builders Inc.",
    "payoutAddress": "0x1234...abcd",
    "registeredAt": 1719897600000
  }
]
```

### `POST /contractors`

Register a new contractor.

**Request Body**
```json
{ "name": "Acme Builders Inc.", "payoutAddress": "0x1234...abcd" }
```

**Response** `201` — The created contractor object.

### `GET /contractors/:id`

Returns a single contractor by ID. **200** or **404**.

### `PUT /contractors/:id`

Update a contractor's name and/or payout address.

**Request Body** (either field optional)
```json
{ "name": "New Name", "payoutAddress": "0xNewAddress" }
```

**Response** `200` — Updated contractor object.

**Error** `400`
```json
{ "error": "Invalid EVM address format. Must be 0x prefixed, 42 hex characters." }
```

### `DELETE /contractors/:id`

Delete a contractor.

**Response** `200`
```json
{ "message": "Contractor deleted successfully" }
```

**Error** `400`
```json
{ "error": "Cannot delete contractor with funded milestones on any project. Complete or reassign that work first." }
```

### `GET /contractors/:id/ledger`

Returns ledger entries for a specific contractor (filtered by `payeeId`). **200**.

---

## System

### `GET /system/risk`

Returns risk scores for all non-completed projects.

**Response** `200`
```json
{
  "project-uuid-1": { "scheduleRisk": 60, "liquidityRisk": 25, "fundingRisk": 40, "contractorRisk": 50, "composite": 45 },
  "project-uuid-2": { "scheduleRisk": 100, "liquidityRisk": 10, "fundingRisk": 0, "contractorRisk": 20, "composite": 38 }
}
```

### `GET /system/forecast?horizonDays=90`

Returns cash flow forecast and settlement summary.

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `horizonDays` | number | 90 | Forecast horizon in days |

**Response** `200`
```json
{
  "cash": {
    "days": [0, 7, 14, 21],
    "available": ["60", "55", "50", "45"],
    "locked": ["30", "30", "25", "20"],
    "settled": ["10", "15", "25", "35"]
  },
  "settlement": {
    "totalSettled": "10",
    "byProject": { "project-uuid": "10" }
  }
}
```

### `GET /system/allocations`

Returns priority-ranked capital allocation recommendations for up to 10 projects.

**Response** `200`
```json
[
  {
    "projectId": "uuid",
    "projectName": "Site Renovation — Block C",
    "score": 82,
    "recommendation": "fund",
    "requestableCap": "10",
    "reason": "Score 82"
  }
]
```

Recommendation values: `fund` (score > 70, sufficient capital), `watch` (score > 50), `hold` (score > 30), `skip` (score ≤ 30).

### `POST /system/reset-demo`

Resets state entirely back to the seeded demo workspace (`src/demo-data.ts`). Destructive
— all projects, contractors, and ledger history created since the last reset are lost.

**Response** `200`
```json
{ "message": "Demo workspace reset successfully" }
```

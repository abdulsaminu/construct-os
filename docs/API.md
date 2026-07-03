# API Reference

Base URL: `http://localhost:3001`

All responses are JSON. Monetary values are serialized as strings (e.g., `"250000000000"`).

---

## Health Check

### `GET /`

Returns the API status and version.

**Response** `200`
```json
{ "status": "ok", "version": "0.3.0" }
```

---

## Economy

### `GET /economy`

Returns the capital treasury overview.

**Response** `200`
```json
{
  "totalCapital": "500000000000",
  "availableCapital": "300000000000",
  "lockedCapital": "150000000000",
  "settledCapital": "50000000000"
}
```

### `POST /economy/deposit`

Deposit capital into the treasury.

**Request Body**
```json
{ "amount": "100000000000" }
```

**Response** `200`
```json
{
  "totalCapital": "600000000000",
  "lockedCapital": "150000000000",
  "settledCapital": "50000000000"
}
```

**Error** `400`
```json
{ "error": "Invalid amount" }
```

---

## Projects

### `GET /projects`

Returns all projects with milestones.

**Response** `200`
```json
[
  {
    "id": "uuid",
    "name": "Highway Bridge Repair",
    "totalBudget": "100000000000",
    "status": "active",
    "createdAt": 1719897600000,
    "milestones": [
      {
        "id": "uuid",
        "name": "Site Preparation",
        "budget": "25000000000",
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

Create a new project. Milestone budgets must sum to `totalBudget`.

**Request Body**
```json
{
  "name": "New Construction Project",
  "totalBudget": "200000000000",
  "milestones": [
    { "name": "Phase 1", "budget": "100000000000", "payeeId": "contractor-uuid" },
    { "name": "Phase 2", "budget": "100000000000" }
  ]
}
```

**Response** `201` — Returns the created project (same shape as `GET /projects/:id`).

**Error** `400`
```json
{ "error": "Milestone budgets must sum to totalBudget" }
```

### `GET /projects/:id`

Returns a single project by ID.

**Response** `200` — Project object. **404** if not found.

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
- `"Insufficient available capital"`

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

### `POST /projects/:id/complete`

Complete a project. Settles all claimed-but-unsettled milestones. Moves capital from locked to settled. Triggers Arc blockchain settlement for on-chain proof.

**Request Body**: None.

**Response** `200` — Updated project object with settlement metadata injected into ledger entries:
```json
{
  "metadata": {
    "txHash": "0xabc123...",
    "blockNumber": 18942501,
    "gasUsed": "187432"
  }
}
```

**Errors** `400`
- `"No claimed milestones to settle. Contractor must claim work first."`

### `GET /projects/:id/ledger`

Returns ledger entries for a specific project.

**Response** `200` — Array of `LedgerEntry` objects.

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

### `GET /contractors/:id/ledger`

Returns ledger entries for a specific contractor (filtered by `payeeId`). **200**.

---

## System Intelligence

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
    "days": [0, 7, 14, 21, ...],
    "available": ["300000000000", ...],
    "locked": ["150000000000", ...],
    "settled": ["50000000000", ...]
  },
  "settlement": {
    "totalSettled": "50000000000",
    "byProject": { "project-uuid": "50000000000" }
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
    "projectName": "Highway Bridge Repair",
    "score": 82,
    "recommendation": "fund",
    "requestableCap": "50000000000",
    "reason": "Score 82"
  }
]
```

Recommendation values: `fund` (score > 70, sufficient capital), `watch` (score > 50), `hold` (score > 30), `skip` (score ≤ 30).
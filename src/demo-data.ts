import { CFELState } from './engine.js';

export const DEMO_CONTRACTOR = {
  id: 'demo-contractor-001',
  name: 'Urban Builders Ltd',
  payoutAddress: '',
  registeredAt: Date.now()
};

// NOTE: All budget/capital amounts are WHOLE USDC dollars, matching the
// convention used throughout engine.ts and settlement-arc.ts (which
// multiply by 1_000_000n or 10**18n internally for on-chain minor units).
// The previous version of this file used amounts like 10000000n intending
// "10 USDC in minor units" — but nothing else in the codebase treats these
// bigints as minor units, so it was actually read as $10,000,000 and made
// funding impossible against a realistic testnet treasury balance.
export const DEMO_PROJECT = {
  id: 'demo-project-001',
  name: 'Abuja Smart Housing Estate - Phase I',
  description: 'Construction of a residential housing estate financed through milestone-based capital allocation.',
  totalBudget: 20n, // $20 total — one faucet visit covers a full cycle
  status: 'draft' as const,
  createdAt: Date.now(),
  estimatedDurationDays: 90,
  plannedStartDate: Date.now(),
  plannedFinishDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
  milestones: [
    { id: 'demo-ms-001', name: 'Foundation', budget: 4n, funded: false, claimed: false, settled: false, payeeId: DEMO_CONTRACTOR.id },
    { id: 'demo-ms-002', name: 'Superstructure', budget: 4n, funded: false, claimed: false, settled: false, payeeId: DEMO_CONTRACTOR.id },
    { id: 'demo-ms-003', name: 'Roofing', budget: 4n, funded: false, claimed: false, settled: false, payeeId: DEMO_CONTRACTOR.id },
    { id: 'demo-ms-004', name: 'Mechanical, Electrical & Plumbing (MEP)', budget: 4n, funded: false, claimed: false, settled: false, payeeId: DEMO_CONTRACTOR.id },
    { id: 'demo-ms-005', name: 'Finishes', budget: 2n, funded: false, claimed: false, settled: false, payeeId: DEMO_CONTRACTOR.id },
    { id: 'demo-ms-006', name: 'Practical Completion', budget: 2n, funded: false, claimed: false, settled: false, payeeId: DEMO_CONTRACTOR.id },
  ]
};

// Treasury starts at zero — no fictional seed balance. Every dollar shown as
// available/locked/settled capital should be traceable to a real deposit
// (either a trusted Demo Mode deposit you actually control, or a verified
// on-chain deposit via a connected wallet).
export const DEMO_TREASURY_BALANCE = 0n;

export function createDemoState(): CFELState {
  return {
    economy: {
      totalCapital: DEMO_TREASURY_BALANCE,
      lockedCapital: 0n,
      settledCapital: 0n
    },
    projects: [DEMO_PROJECT],
    contractors: [DEMO_CONTRACTOR],
    ledger: []
  };
}

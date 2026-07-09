#!/usr/bin/env tsx
/**
 * ConstructOS Demo Workspace Reset Script
 * 
 * Usage:
 *   npm run reset-demo
 * 
 * This script:
 * - Deletes all stored JSON data
 * - Recreates demo data with realistic values
 * - Preserves environment configuration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const stateFile = path.join(dataDir, 'constructos.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Demo data matching src/demo-data.ts
const demoState = {
  economy: {
    totalCapital: { __bi: '100' },      // 100 USDC
    lockedCapital: { __bi: '0' },
    settledCapital: { __bi: '0' }
  },
  contractors: [
    {
      id: 'demo-contractor-001',
      name: 'Urban Builders Ltd',
      payoutAddress: '',
      registeredAt: Date.now()
    }
  ],
  projects: [
    {
      id: 'demo-project-001',
      name: 'Abuja Smart Housing Estate - Phase I',
      description: 'Construction of a residential housing estate financed through milestone-based capital allocation.',
      totalBudget: { __bi: '50' },  // 50 USDC
      status: 'draft',
      createdAt: Date.now(),
      estimatedDurationDays: 90,
      plannedStartDate: Date.now(),
      plannedFinishDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
      milestones: [
        { id: 'demo-ms-001', name: 'Foundation', budget: { __bi: '10' }, funded: false, claimed: false, settled: false, payeeId: 'demo-contractor-001' },
        { id: 'demo-ms-002', name: 'Superstructure', budget: { __bi: '10' }, funded: false, claimed: false, settled: false, payeeId: 'demo-contractor-001' },
        { id: 'demo-ms-003', name: 'Roofing', budget: { __bi: '10' }, funded: false, claimed: false, settled: false, payeeId: 'demo-contractor-001' },
        { id: 'demo-ms-004', name: 'Mechanical, Electrical & Plumbing (MEP)', budget: { __bi: '10' }, funded: false, claimed: false, settled: false, payeeId: 'demo-contractor-001' },
        { id: 'demo-ms-005', name: 'Finishes', budget: { __bi: '5' }, funded: false, claimed: false, settled: false, payeeId: 'demo-contractor-001' },
        { id: 'demo-ms-006', name: 'Practical Completion', budget: { __bi: '5' }, funded: false, claimed: false, settled: false, payeeId: 'demo-contractor-001' },
      ]
    }
  ],
  ledger: []
};

// Write the demo state
fs.writeFileSync(stateFile, JSON.stringify(demoState, null, 2));

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║        ConstructOS Demo Workspace Reset                  ║');
console.log('╠══════════════════════════════════════════════════════════╣');
console.log('║                                                          ║');
console.log('║  ✓ All previous data deleted                             ║');
console.log('║  ✓ Treasury initialized: 100 USDC                        ║');
console.log('║  ✓ Contractor created: Urban Builders Ltd                ║');
console.log('║  ✓ Project created: Abuja Smart Housing Estate - Phase I ║');
console.log('║  ✓ Budget: 50 USDC across 6 milestones                   ║');
console.log('║  ✓ Duration: 90 days                                     ║');
console.log('║                                                          ║');
console.log('║  Next steps:                                             ║');
console.log('║  1. Start server: npm run dev                            ║');
console.log('║  2. Open http://localhost:5173                           ║');
console.log('║  3. Edit contractor wallet with Arc test address         ║');
console.log('║  4. Fund milestones in order                             ║');
console.log('║                                                          ║');
console.log('╚══════════════════════════════════════════════════════════╝');

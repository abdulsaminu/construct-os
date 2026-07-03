import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createInitialState, dispatch } from '../src/engine.js';
import { getAvailableCapital } from '../src/economy.js';

describe('Engine', () => {
  it('should chain state properly to fund milestones', () => {
    let state = createInitialState(1_000_000n);

    // Step 1: Register Contractor
    const cRes = dispatch(state, { type: 'REGISTER_CONTRACTOR', payload: { name: 'Test Co', payoutAddress: '0x123' } });
    assert.strictEqual(cRes.success, true);
    state = cRes.state;
    const contractorId = state.contractors[0].id;

    // Step 2: Create Project
    const pRes = dispatch(state, { type: 'CREATE_PROJECT', payload: {
      name: 'Test Project', totalBudget: 600_000n,
      milestones: [
        { name: 'Phase 1', budget: 300_000n, payeeId: contractorId },
        { name: 'Phase 2', budget: 300_000n, payeeId: contractorId }
      ]
    }});
    assert.strictEqual(pRes.success, true);
    state = pRes.state;
    const project = state.projects[0];

    // Step 3: Fund Milestone
    const fRes = dispatch(state, { type: 'FUND_MILESTONE', payload: { projectId: project.id, milestoneId: project.milestones[0].id } });
    assert.strictEqual(fRes.success, true);
    state = fRes.state;

    // Step 4: Assert Economy
    assert.strictEqual(getAvailableCapital(state.economy), 700_000n);
    assert.strictEqual(state.economy.lockedCapital, 300_000n);
    assert.strictEqual(state.projects[0].milestones[0].funded, true);
    assert.strictEqual(state.projects[0].milestones[1].funded, false);
  });
});

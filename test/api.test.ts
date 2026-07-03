import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createInitialState } from '../src/engine.js';
import { handleApiRequest } from '../src/api.js';

describe('API Router', () => {
  it('should create a project and return new state via API', () => {
    let state = createInitialState(1_000_000n);

    const cRes = handleApiRequest(state, { method: 'POST', path: '/contractors', body: { name: 'Acme', payoutAddress: '0xabc' } });
    assert.strictEqual(cRes.statusCode, 201);
    assert.ok(cRes.newState, "API must return newState for mutations");
    state = cRes.newState!;

    const pRes = handleApiRequest(state, { method: 'POST', path: '/projects', body: {
      name: 'Tower', totalBudget: "500000",
      milestones: [{ name: 'M1', budget: "500000", payeeId: state.contractors[0].id }]
    }});
    assert.strictEqual(pRes.statusCode, 201);
    assert.strictEqual(pRes.newState!.projects.length, 1);
  });
});

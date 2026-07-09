import { CFELState, dispatch, getSettlementCandidates } from './engine.js';
import { getAvailableCapital } from './economy.js';
import { filterByProject, filterByPayee } from './ledger.js';
import { scoreProjectRisk, scoreAllProjects } from './risk.js';
import { forecastProjectCompletion, forecastCash, forecastSettlement } from './forecast.js';
import { rankAllocations } from './allocation.js';

export interface ApiRequest { method: string; path: string; body?: unknown; params?: Record<string, string> }
export interface ApiResponse { statusCode: number; body: unknown; newState?: CFELState; resetState?: boolean }

export function handleApiRequest(state: CFELState, req: ApiRequest): ApiResponse {
  const { method, path, body, params = {} } = req;
  const segments = path.split('/').filter(Boolean);

  if (method === 'GET' && path === '/') return { statusCode: 200, body: { status: 'ok', version: '0.4.0' } };

  if (method === 'GET' && path === '/economy') {
    return { statusCode: 200, body: {
      totalCapital: state.economy.totalCapital.toString(),
      availableCapital: getAvailableCapital(state.economy).toString(),
      lockedCapital: state.economy.lockedCapital.toString(),
      settledCapital: state.economy.settledCapital.toString(),
    }};
  }

  if (method === 'POST' && path === '/economy/deposit') {
    const { amount } = body as any;
    const result = dispatch(state, { type: 'DEPOSIT_CAPITAL', payload: { amount: BigInt(amount) } });
    if (!result.success) return { statusCode: 400, body: { error: result.error } };
    return { statusCode: 200, body: result.state.economy, newState: result.state };
  }

  // NOTE: On-chain-verified deposits (wallet-connect flow) are handled directly
  // in server.ts as `/economy/deposit-onchain`, not here — verifying a
  // transaction hash requires a real RPC call, and this handler is a pure,
  // synchronous function with no I/O. See server.ts for that route.

  // RESET DEMO WORKSPACE
  if (method === 'POST' && path === '/system/reset-demo') {
    return { statusCode: 200, body: { message: 'Demo workspace reset successfully' }, resetState: true };
  }

  if (method === 'DELETE' && segments[0] === 'contractors' && segments.length === 2) {
    const result = dispatch(state, { type: 'DELETE_CONTRACTOR', payload: { contractorId: segments[1] } });
    if (!result.success) return { statusCode: 400, body: { error: result.error } };
    return { statusCode: 200, body: { message: 'Contractor deleted successfully' }, newState: result.state };
  }

  if (method === 'GET' && path === '/contractors') {
    const mappedContractors = state.contractors.map(c => {
      const assignedProjects = state.projects
        .filter(p => p.milestones.some(m => m.payeeId === c.id))
        .map(p => {
          const completedMilestones = p.milestones.filter(m => m.claimed || m.settled).length;
          const currentMilestone = p.milestones.find(m => !m.claimed && !m.settled);
          return {
            id: p.id,
            name: p.name,
            status: p.status,
            totalBudget: p.totalBudget.toString(),
            completionPercent: Math.round((completedMilestones / p.milestones.length) * 100),
            currentMilestone: currentMilestone ? currentMilestone.name : 'Completed',
            assignmentDate: p.createdAt
          };
        });
      return { ...c, assignedProjects };
    });
    return { statusCode: 200, body: mappedContractors };
  }

  if (method === 'POST' && path === '/contractors') {
    const { name, payoutAddress } = body as any;
    const result = dispatch(state, { type: 'REGISTER_CONTRACTOR', payload: { name, payoutAddress } });
    if (!result.success) return { statusCode: 400, body: { error: result.error } };
    return { statusCode: 201, body: result.state.contractors[result.state.contractors.length - 1], newState: result.state };
  }

  if (method === 'GET' && segments[0] === 'contractors' && segments.length === 2) {
    const c = state.contractors.find(c => c.id === segments[1]);
    if (!c) return { statusCode: 404, body: { error: 'Not found' } };

    const assignedProjects = state.projects
      .filter(p => p.milestones.some(m => m.payeeId === c.id))
      .map(p => {
        const completedMilestones = p.milestones.filter(m => m.claimed || m.settled).length;
        const currentMilestone = p.milestones.find(m => !m.claimed && !m.settled);
        return {
          id: p.id,
          name: p.name,
          status: p.status,
          totalBudget: p.totalBudget.toString(),
          completionPercent: Math.round((completedMilestones / p.milestones.length) * 100),
          currentMilestone: currentMilestone ? currentMilestone.name : 'Completed',
          assignmentDate: p.createdAt
        };
      });

    return { statusCode: 200, body: { ...c, assignedProjects } };
  }

  // FIXED: Contractor Update - Uses dispatch instead of direct mutation
  if (method === 'PUT' && segments[0] === 'contractors' && segments.length === 2) {
    const contractorId = segments[1];
    const updates = body as { name?: string; payoutAddress?: string };

    // Validate EVM address if provided
    if (updates.payoutAddress !== undefined) {
      if (!updates.payoutAddress || !/^0x[a-fA-F0-9]{40}$/.test(updates.payoutAddress)) {
        return { statusCode: 400, body: { error: 'Invalid EVM address format. Must be 0x prefixed, 42 hex characters.' } };
      }
    }

    const result = dispatch(state, { type: 'UPDATE_CONTRACTOR', payload: { contractorId, ...updates } });
    if (!result.success) return { statusCode: 404, body: { error: result.error } };

    const updatedContractor = result.state.contractors.find(c => c.id === contractorId);
    return { statusCode: 200, body: updatedContractor, newState: result.state };
  }

  if (method === 'GET' && segments[0] === 'contractors' && segments.length === 3 && segments[2] === 'ledger') {
    return { statusCode: 200, body: filterByPayee(state.ledger, segments[1]) };
  }

  if (method === 'GET' && path === '/projects') return { statusCode: 200, body: state.projects };

  if (method === 'POST' && path === '/projects') {
    const { name, totalBudget, milestones, plannedStartDate, plannedFinishDate } = body as any;
    const parsedMilestones = milestones.map((m: any) => ({ ...m, budget: BigInt(m.budget) }));
    const result = dispatch(state, {
      type: 'CREATE_PROJECT',
      payload: {
        name,
        totalBudget: BigInt(totalBudget),
        milestones: parsedMilestones,
        plannedStartDate: plannedStartDate ? Number(plannedStartDate) : undefined,
        plannedFinishDate: plannedFinishDate ? Number(plannedFinishDate) : undefined,
      }
    });
    if (!result.success) return { statusCode: 400, body: { error: result.error } };
    return { statusCode: 201, body: result.state.projects[result.state.projects.length - 1], newState: result.state };
  }

  if (method === 'GET' && segments[0] === 'projects' && segments.length === 2) {
    const p = state.projects.find(p => p.id === segments[1]);
    return p ? { statusCode: 200, body: p } : { statusCode: 404, body: { error: 'Not found' } };
  }

  if (method === 'GET' && segments[0] === 'projects' && segments.length === 3 && segments[2] === 'ledger') {
    return { statusCode: 200, body: filterByProject(state.ledger, segments[1]) };
  }

  if (method === 'GET' && segments[0] === 'projects' && segments.length === 3 && segments[2] === 'risk') {
    const p = state.projects.find(p => p.id === segments[1]);
    return p ? { statusCode: 200, body: scoreProjectRisk(p, state) } : { statusCode: 404, body: { error: 'Not found' } };
  }

  if (method === 'GET' && segments[0] === 'projects' && segments.length === 3 && segments[2] === 'forecast') {
    const p = state.projects.find(p => p.id === segments[1]);
    return p ? { statusCode: 200, body: forecastProjectCompletion(p) } : { statusCode: 404, body: { error: 'Not found' } };
  }

  // FIXED: Milestone Funding - Uses stage order validation from engine
  if (method === 'POST' && segments[0] === 'projects' && segments.length === 4 && segments[2] === 'milestones' && segments[3] === 'fund') {
    const { milestoneId } = body as any;
    const result = dispatch(state, { type: 'FUND_MILESTONE', payload: { projectId: segments[1], milestoneId } });
    if (!result.success) return { statusCode: 400, body: { error: result.error } };
    return { statusCode: 200, body: result.state.projects.find(p => p.id === segments[1]), newState: result.state };
  }

  if (method === 'POST' && segments[0] === 'projects' && segments.length === 4 && segments[2] === 'milestones' && segments[3] === 'claim') {
    const { milestoneId, contractorId } = body as any;
    const result = dispatch(state, { type: 'CLAIM_MILESTONE', payload: { projectId: segments[1], milestoneId, contractorId } });
    if (!result.success) return { statusCode: 400, body: { error: result.error } };
    return { statusCode: 200, body: result.state.projects.find(p => p.id === segments[1]), newState: result.state };
  }

  if (method === 'DELETE' && segments[0] === 'projects' && segments.length === 2) {
    const result = dispatch(state, { type: 'DELETE_PROJECT', payload: { projectId: segments[1] } });
    if (!result.success) return { statusCode: 400, body: { error: result.error } };
    return { statusCode: 200, body: { message: 'Project deleted successfully' }, newState: result.state };
  }

  // CHANGED: /complete is now validation-only and mutates NOTHING.
  // It returns the list of milestones eligible for settlement so server.ts
  // can submit each one to Arc Testnet first. Only once a milestone's
  // settlement is genuinely confirmed on-chain does server.ts dispatch
  // CONFIRM_SETTLEMENT, which is the only thing that actually marks a
  // milestone `settled` and moves capital from locked -> settled.
  if (method === 'POST' && segments[0] === 'projects' && segments.length === 3 && segments[2] === 'complete') {
    const projectId = segments[1];
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return { statusCode: 404, body: { error: 'Project not found' } };

    const result = dispatch(state, { type: 'COMPLETE_PROJECT', payload: { projectId } });
    if (!result.success) return { statusCode: 400, body: { error: result.error } };

    const pendingSettlements = getSettlementCandidates(state, projectId);
    return { statusCode: 200, body: { project, pendingSettlements } };
  }

  if (method === 'GET' && path === '/system/risk') return { statusCode: 200, body: scoreAllProjects(state) };

  if (method === 'GET' && path === '/system/forecast') {
    const days = parseInt(params.horizonDays || '90');
    return { statusCode: 200, body: { cash: forecastCash(state, days), settlement: forecastSettlement(state, days) } };
  }

  if (method === 'GET' && path === '/system/allocations') {
    return { statusCode: 200, body: rankAllocations(state, { topN: 10, maxPerProject: state.economy.totalCapital / 10n }) };
  }

  return { statusCode: 404, body: { error: 'Not found' } };
}

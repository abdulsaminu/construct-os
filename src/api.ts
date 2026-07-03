import { CFELState, dispatch } from './engine.js';
import { getAvailableCapital } from './economy.js';
import { filterByProject, filterByPayee } from './ledger.js';
import { scoreProjectRisk, scoreAllProjects } from './risk.js';
import { forecastProjectCompletion, forecastCash, forecastSettlement } from './forecast.js';
import { rankAllocations } from './allocation.js';

export interface ApiRequest { method: string; path: string; body?: unknown; params?: Record<string, string> }
export interface ApiResponse { statusCode: number; body: unknown; newState?: CFELState }

export function handleApiRequest(state: CFELState, req: ApiRequest): ApiResponse {
  const { method, path, body, params = {} } = req;
  const segments = path.split('/').filter(Boolean);

  if (method === 'GET' && path === '/') return { statusCode: 200, body: { status: 'ok', version: '0.3.0' } };

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

  if (method === 'GET' && path === '/contractors') return { statusCode: 200, body: state.contractors };
  
  if (method === 'POST' && path === '/contractors') {
    const { name, payoutAddress } = body as any;
    const result = dispatch(state, { type: 'REGISTER_CONTRACTOR', payload: { name, payoutAddress } });
    if (!result.success) return { statusCode: 400, body: { error: result.error } };
    return { statusCode: 201, body: result.state.contractors[result.state.contractors.length - 1], newState: result.state };
  }

  if (method === 'GET' && segments[0] === 'contractors' && segments.length === 2) {
    const c = state.contractors.find(c => c.id === segments[1]);
    return c ? { statusCode: 200, body: c } : { statusCode: 404, body: { error: 'Not found' } };
  }

  if (method === 'GET' && segments[0] === 'contractors' && segments.length === 3 && segments[2] === 'ledger') {
    return { statusCode: 200, body: filterByPayee(state.ledger, segments[1]) };
  }

  if (method === 'GET' && path === '/projects') return { statusCode: 200, body: state.projects };

  if (method === 'POST' && path === '/projects') {
    const { name, totalBudget, milestones } = body as any;
    const parsedMilestones = milestones.map((m: any) => ({ ...m, budget: BigInt(m.budget) }));
    const result = dispatch(state, { type: 'CREATE_PROJECT', payload: { name, totalBudget: BigInt(totalBudget), milestones: parsedMilestones } });
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

  if (method === 'POST' && segments[0] === 'projects' && segments.length === 4 && segments[2] === 'milestones' && segments[3] === 'fund') {
    const { milestoneId } = body as any;
    const result = dispatch(state, { type: 'FUND_MILESTONE', payload: { projectId: segments[1], milestoneId } });
    if (!result.success) return { statusCode: 400, body: { error: result.error } };
    return { statusCode: 200, body: result.state.projects.find(p => p.id === segments[1]), newState: result.state };
  }

  // NEW: Claim Milestone Endpoint
  if (method === 'POST' && segments[0] === 'projects' && segments.length === 4 && segments[2] === 'milestones' && segments[3] === 'claim') {
    const { milestoneId, contractorId } = body as any;
    const result = dispatch(state, { type: 'CLAIM_MILESTONE', payload: { projectId: segments[1], milestoneId, contractorId } });
    if (!result.success) return { statusCode: 400, body: { error: result.error } };
    return { statusCode: 200, body: result.state.projects.find(p => p.id === segments[1]), newState: result.state };
  }

  if (method === 'POST' && segments[0] === 'projects' && segments.length === 3 && segments[2] === 'complete') {
    const result = dispatch(state, { type: 'COMPLETE_PROJECT', payload: { projectId: segments[1] } });
    if (!result.success) return { statusCode: 400, body: { error: result.error } };
    return { statusCode: 200, body: result.state.projects.find(p => p.id === segments[1]), newState: result.state };
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

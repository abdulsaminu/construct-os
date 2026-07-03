import { Economy, createInitialEconomy, getAvailableCapital, assertConservation } from './economy.js';
import { Project, Milestone, Contractor, createProject, createContractor } from './execution.js';
import { LedgerEntry, createLedgerEntry } from './ledger.js';

export interface CFELState {
  economy: Economy;
  projects: Project[];
  contractors: Contractor[];
  ledger: LedgerEntry[];
}

export function createInitialState(initialCapital: bigint): CFELState {
  return { economy: createInitialEconomy(initialCapital), projects: [], contractors: [], ledger: [] };
}

export type Command =
  | { type: "CREATE_PROJECT"; payload: { name: string; totalBudget: bigint; milestones: Omit<Milestone, "id" | "funded" | "claimed" | "settled">[] } }
  | { type: "FUND_MILESTONE"; payload: { projectId: string; milestoneId: string } }
  | { type: "CLAIM_MILESTONE"; payload: { projectId: string; milestoneId: string; contractorId: string } }
  | { type: "COMPLETE_PROJECT"; payload: { projectId: string } }
  | { type: "REGISTER_CONTRACTOR"; payload: { name: string; payoutAddress: string } }
  | { type: "DEPOSIT_CAPITAL"; payload: { amount: bigint } };

export type CommandResult = { success: true; state: CFELState; events: LedgerEntry[] } | { success: false; error: string };

export function dispatch(state: CFELState, command: Command): CommandResult {
  let newState = { ...state, projects: [...state.projects.map(p => ({...p, milestones: [...p.milestones]}))], contractors: [...state.contractors], ledger: [...state.ledger] };
  let events: LedgerEntry[] = [];

  switch (command.type) {
    case "DEPOSIT_CAPITAL": {
      newState.economy = { ...newState.economy, totalCapital: newState.economy.totalCapital + command.payload.amount };
      const entry = createLedgerEntry({ projectId: "system", type: "CAPITAL_DEPOSIT", amount: command.payload.amount });
      events.push(entry);
      newState.ledger.push(entry);
      break;
    }
    case "CREATE_PROJECT": {
      const project = createProject(command.payload);
      for (const m of project.milestones) {
        if (m.payeeId && !newState.contractors.find(c => c.id === m.payeeId)) {
          return { success: false, error: `Unknown contractor: ${m.payeeId}` };
        }
      }
      newState.projects.push(project);
      break;
    }
    case "REGISTER_CONTRACTOR": {
      newState.contractors.push(createContractor(command.payload));
      break;
    }
    case "FUND_MILESTONE": {
      const { projectId, milestoneId } = command.payload;
      const projectIdx = newState.projects.findIndex(p => p.id === projectId);
      if (projectIdx === -1) return { success: false, error: "Project not found" };
      const project = newState.projects[projectIdx];
      const milestoneIdx = project.milestones.findIndex(m => m.id === milestoneId);
      if (milestoneIdx === -1) return { success: false, error: "Milestone not found" };
      const milestone = project.milestones[milestoneIdx];
      if (milestone.funded) return { success: false, error: "Milestone already funded" };
      if (getAvailableCapital(newState.economy) < milestone.budget) return { success: false, error: "Insufficient available capital" };

      const updatedMilestones = project.milestones.map((m, i) => i === milestoneIdx ? { ...m, funded: true } : m);
      const allFunded = updatedMilestones.every(m => m.funded);
      
      // Project becomes active only when ALL milestones are funded
      newState.projects[projectIdx] = { ...project, milestones: updatedMilestones, status: allFunded ? "active" : project.status };
      newState.economy = { ...newState.economy, lockedCapital: newState.economy.lockedCapital + milestone.budget };
      
      const entry = createLedgerEntry({ projectId, type: "MILESTONE_FUNDED", amount: milestone.budget, payeeId: milestone.payeeId, milestoneId });
      events.push(entry);
      newState.ledger.push(entry);
      break;
    }
    case "CLAIM_MILESTONE": {
      const { projectId, milestoneId, contractorId } = command.payload;
      const projectIdx = newState.projects.findIndex(p => p.id === projectId);
      if (projectIdx === -1) return { success: false, error: "Project not found" };
      const project = newState.projects[projectIdx];
      const milestoneIdx = project.milestones.findIndex(m => m.id === milestoneId);
      if (milestoneIdx === -1) return { success: false, error: "Milestone not found" };
      const milestone = project.milestones[milestoneIdx];
      
      if (!milestone.funded) return { success: false, error: "Milestone not funded yet" };
      if (milestone.claimed) return { success: false, error: "Milestone already claimed" };
      if (milestone.payeeId !== contractorId) return { success: false, error: "Unauthorized: Only assigned contractor can claim" };

      const updatedMilestones = project.milestones.map((m, i) => i === milestoneIdx ? { ...m, claimed: true, claimedAt: Date.now() } : m);
      newState.projects[projectIdx] = { ...project, milestones: updatedMilestones };
      
      const entry = createLedgerEntry({ projectId, type: "MILESTONE_CLAIMED", amount: 0n, payeeId: contractorId, milestoneId, metadata: { milestoneName: milestone.name } });
      events.push(entry);
      newState.ledger.push(entry);
      break;
    }
    case "COMPLETE_PROJECT": {
      const { projectId } = command.payload;
      const projectIdx = newState.projects.findIndex(p => p.id === projectId);
      if (projectIdx === -1) return { success: false, error: "Project not found" };
      const project = newState.projects[projectIdx];
      
      const claimedMilestones = project.milestones.filter(m => m.claimed && !m.settled);
      if (claimedMilestones.length === 0) {
        return { success: false, error: "No claimed milestones to settle. Contractor must claim work first." };
      }

      let totalSettlement = 0n;
      const updatedMilestones = project.milestones.map(m => {
        if (m.claimed && !m.settled) {
          totalSettlement += m.budget;
          const entry = createLedgerEntry({ projectId, type: "SETTLEMENT", amount: m.budget, payeeId: m.payeeId, milestoneId: m.id });
          events.push(entry);
          newState.ledger.push(entry);
          return { ...m, settled: true };
        }
        return m;
      });

      // THE FIX: Only mark project as completed if EVERY milestone is settled
      const allSettled = updatedMilestones.every(m => m.settled);

      newState.projects[projectIdx] = { 
        ...project, 
        milestones: updatedMilestones, 
        status: allSettled ? "completed" : project.status, // Keeps it "active" or "draft" if work remains
        completedAt: allSettled ? Date.now() : undefined
      };
      
      newState.economy = {
        ...newState.economy,
        lockedCapital: newState.economy.lockedCapital - totalSettlement,
        settledCapital: newState.economy.settledCapital + totalSettlement,
      };
      break;
    }
    default:
      return { success: false, error: "Unknown command" };
  }

  try { assertConservation(newState.economy); } catch (err) { return { success: false, error: String(err) } };
  return { success: true, state: newState, events };
}

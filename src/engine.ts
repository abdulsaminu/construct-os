import { Economy, createInitialEconomy, getAvailableCapital, assertConservation } from './economy.js';
import { Project, Milestone, Contractor, createProject, createContractor, getStageOrder } from './execution.js';
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
  | { type: "CREATE_PROJECT"; payload: { name: string; totalBudget: bigint; milestones: Omit<Milestone, "id" | "funded" | "claimed" | "settled">[]; plannedStartDate?: number; plannedFinishDate?: number } }
  | { type: "FUND_MILESTONE"; payload: { projectId: string; milestoneId: string } }
  | { type: "CLAIM_MILESTONE"; payload: { projectId: string; milestoneId: string; contractorId: string } }
  | { type: "COMPLETE_PROJECT"; payload: { projectId: string } }
  | { type: "CONFIRM_SETTLEMENT"; payload: { projectId: string; milestoneId: string; txHash: string; blockNumber?: number; gasUsed?: bigint } }
  | { type: "RECORD_SETTLEMENT_FAILURE"; payload: { projectId: string; milestoneId: string; error: string } }
  | { type: "REGISTER_CONTRACTOR"; payload: { name: string; payoutAddress: string } }
  | { type: "UPDATE_CONTRACTOR"; payload: { contractorId: string; name?: string; payoutAddress?: string } }
  | { type: "DELETE_PROJECT"; payload: { projectId: string } }
  | { type: "DELETE_CONTRACTOR"; payload: { contractorId: string } }
  | { type: "DEPOSIT_CAPITAL"; payload: { amount: bigint; txHash?: string; fromAddress?: string } };

export type CommandResult = { success: true; state: CFELState; events: LedgerEntry[] } | { success: false; error: string };

// Helper: Find earlier incomplete milestone using stage order OR array position
function findEarlierIncomplete(
  milestones: Milestone[],
  targetIndex: number,
  targetName: string,
  checkField: 'funded' | 'claimed'
): Milestone | undefined {
  const targetStageOrder = getStageOrder(targetName);

  // If recognized construction phase, use stage order
  if (targetStageOrder < 99) {
    const earlier = milestones.filter(m => getStageOrder(m.name) < targetStageOrder);
    return earlier.find(m => !m[checkField]);
  }

  // Otherwise fall back to array position (order they were defined)
  return milestones.slice(0, targetIndex).find(m => !m[checkField]);
}

/**
 * Pure, read-only helper: returns the milestones on a project that are
 * claimed but not yet settled. Used by the API layer to know which
 * settlements need to be submitted to Arc before CONFIRM_SETTLEMENT can
 * be dispatched. Performs no mutation and creates no ledger entries.
 */
export function getSettlementCandidates(
  state: CFELState,
  projectId: string
): { milestoneId: string; payeeId: string; amount: bigint }[] {
  const project = state.projects.find(p => p.id === projectId);
  if (!project) return [];
  return project.milestones
    .filter(m => m.claimed && !m.settled && m.payeeId)
    .map(m => ({ milestoneId: m.id, payeeId: m.payeeId as string, amount: m.budget }));
}

export function dispatch(state: CFELState, command: Command): CommandResult {
  let newState = { ...state, projects: [...state.projects.map(p => ({...p, milestones: [...p.milestones]}))], contractors: [...state.contractors], ledger: [...state.ledger] };
  let events: LedgerEntry[] = [];

  switch (command.type) {
    case "DEPOSIT_CAPITAL": {
      newState.economy = { ...newState.economy, totalCapital: newState.economy.totalCapital + command.payload.amount };
      const entry = createLedgerEntry({
        projectId: "system",
        type: "CAPITAL_DEPOSIT",
        amount: command.payload.amount,
        metadata: {
          ...(command.payload.txHash && { txHash: command.payload.txHash }),
          ...(command.payload.fromAddress && { fromAddress: command.payload.fromAddress }),
        },
      });
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

      const createEvent = createLedgerEntry({ projectId: project.id, type: "PROJECT_CREATED", amount: 0n, metadata: { name: command.payload.name, budget: command.payload.totalBudget.toString() } });
      events.push(createEvent);
      newState.ledger.push(createEvent);

      const uniquePayees = [...new Set(command.payload.milestones.map((m: any) => m.payeeId).filter(Boolean))];
      uniquePayees.forEach((pId: string) => {
        const assignEvent = createLedgerEntry({ projectId: project.id, type: "CONTRACTOR_ASSIGNED", amount: 0n, payeeId: pId, metadata: { projectName: command.payload.name } });
        events.push(assignEvent);
        newState.ledger.push(assignEvent);
      });
      break;
    }
    case "REGISTER_CONTRACTOR": {
      newState.contractors.push(createContractor(command.payload));
      break;
    }
    case "UPDATE_CONTRACTOR": {
      const { contractorId, name, payoutAddress } = command.payload;
      const cIdx = newState.contractors.findIndex(c => c.id === contractorId);
      if (cIdx === -1) return { success: false, error: "Contractor not found" };

      const existing = newState.contractors[cIdx];
      newState.contractors[cIdx] = {
        ...existing,
        ...(name !== undefined && { name }),
        ...(payoutAddress !== undefined && { payoutAddress }),
      };
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

      // SEQUENTIAL VALIDATION: Earlier milestones must be funded
      const unfundedEarlier = findEarlierIncomplete(project.milestones, milestoneIdx, milestone.name, 'funded');
      if (unfundedEarlier) {
        return { success: false, error: `Sequential funding violation: Fund "${unfundedEarlier.name}" before funding "${milestone.name}"` };
      }

      if (getAvailableCapital(newState.economy) < milestone.budget) {
        const available = getAvailableCapital(newState.economy);
        return { success: false, error: `Insufficient available capital. Required: ${Number(milestone.budget).toLocaleString()} | Available: ${Number(available).toLocaleString()}` };
      }

      const updatedMilestones = project.milestones.map((m, i) => i === milestoneIdx ? { ...m, funded: true } : m);

      newState.projects[projectIdx] = { ...project, milestones: updatedMilestones, status: project.status === "draft" ? "active" : project.status };
      newState.economy = { ...newState.economy, lockedCapital: newState.economy.lockedCapital + milestone.budget };

      const entry = createLedgerEntry({ projectId, type: "MILESTONE_FUNDED", amount: milestone.budget, payeeId: milestone.payeeId, milestoneId, metadata: { contractorName: newState.contractors.find(c => c.id === milestone.payeeId)?.name || 'Unknown' } });
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

      // SEQUENTIAL VALIDATION: Earlier milestones must be claimed
      const unclaimedEarlier = findEarlierIncomplete(project.milestones, milestoneIdx, milestone.name, 'claimed');
      if (unclaimedEarlier) {
        return { success: false, error: `Sequential claim violation: Complete "${unclaimedEarlier.name}" before claiming "${milestone.name}"` };
      }

      const updatedMilestones = project.milestones.map((m, i) => i === milestoneIdx ? { ...m, claimed: true, claimedAt: Date.now() } : m);
      newState.projects[projectIdx] = { ...project, milestones: updatedMilestones };

      const entry = createLedgerEntry({ projectId, type: "MILESTONE_CLAIMED", amount: 0n, payeeId: contractorId, milestoneId, metadata: { milestoneName: milestone.name, contractorName: newState.contractors.find(c => c.id === contractorId)?.name || 'Unknown' } });
      events.push(entry);
      newState.ledger.push(entry);
      break;
    }
    case "COMPLETE_PROJECT": {
      // NOTE: This command is now VALIDATION-ONLY. It no longer marks
      // milestones as settled or moves capital. It exists so callers get a
      // clear error if there's nothing eligible to settle.
      //
      // Actual settlement finalization happens one milestone at a time via
      // CONFIRM_SETTLEMENT, which is only dispatched by server.ts after
      // ArcSettlementAdapter returns a genuinely confirmed on-chain receipt.
      // This guarantees a milestone can never show as "settled" without a
      // real, verifiable transaction behind it.
      const { projectId } = command.payload;
      const project = newState.projects.find(p => p.id === projectId);
      if (!project) return { success: false, error: "Project not found" };

      const pending = project.milestones.filter(m => m.claimed && !m.settled);
      if (pending.length === 0) {
        return { success: false, error: "No claimed milestones to settle. Contractor must claim work first." };
      }

      return { success: true, state: newState, events: [] };
    }
    case "CONFIRM_SETTLEMENT": {
      const { projectId, milestoneId, txHash, blockNumber, gasUsed } = command.payload;
      const projectIdx = newState.projects.findIndex(p => p.id === projectId);
      if (projectIdx === -1) return { success: false, error: "Project not found" };
      const project = newState.projects[projectIdx];
      const milestoneIdx = project.milestones.findIndex(m => m.id === milestoneId);
      if (milestoneIdx === -1) return { success: false, error: "Milestone not found" };
      const milestone = project.milestones[milestoneIdx];

      if (!milestone.claimed) return { success: false, error: "Milestone not claimed yet" };
      if (milestone.settled) return { success: false, error: "Milestone already settled" };
      if (!txHash) return { success: false, error: "Refusing to mark settled without a confirmed on-chain transaction hash" };

      const updatedMilestones = project.milestones.map((m, i) => i === milestoneIdx ? { ...m, settled: true } : m);
      const allSettled = updatedMilestones.every(m => m.settled);

      newState.projects[projectIdx] = {
        ...project,
        milestones: updatedMilestones,
        status: allSettled ? "completed" : project.status,
        completedAt: allSettled ? Date.now() : undefined,
      };

      newState.economy = {
        ...newState.economy,
        lockedCapital: newState.economy.lockedCapital - milestone.budget,
        settledCapital: newState.economy.settledCapital + milestone.budget,
      };

      const entry = createLedgerEntry({
        projectId,
        type: "SETTLEMENT",
        amount: milestone.budget,
        payeeId: milestone.payeeId,
        milestoneId,
        metadata: {
          contractorName: newState.contractors.find(c => c.id === milestone.payeeId)?.name || 'Unknown',
          txHash,
          ...(blockNumber !== undefined && { blockNumber }),
          ...(gasUsed !== undefined && { gasUsed: gasUsed.toString() }),
        },
      });
      events.push(entry);
      newState.ledger.push(entry);

      if (allSettled) {
        const totalSettlement = updatedMilestones.reduce((sum, m) => sum + m.budget, 0n);
        const closeEvent = createLedgerEntry({ projectId, type: "PROJECT_CLOSED", amount: totalSettlement, metadata: { name: project.name } });
        events.push(closeEvent);
        newState.ledger.push(closeEvent);
      }
      break;
    }
    case "RECORD_SETTLEMENT_FAILURE": {
      // Audit-trail only: does NOT touch economy or milestone state, so the
      // milestone remains claimed-but-unsettled and eligible for retry.
      const { projectId, milestoneId, error } = command.payload;
      const entry = createLedgerEntry({
        projectId,
        type: "SETTLEMENT_FAILED",
        amount: 0n,
        milestoneId,
        metadata: { error },
      });
      events.push(entry);
      newState.ledger.push(entry);
      break;
    }
    case "DELETE_CONTRACTOR": {
      const { contractorId } = command.payload;
      const contractorIdx = newState.contractors.findIndex(c => c.id === contractorId);
      if (contractorIdx === -1) return { success: false, error: "Contractor not found" };

      const hasFundedWork = newState.projects.some(p =>
        p.milestones.some(m => m.payeeId === contractorId && m.funded)
      );
      if (hasFundedWork) {
        return { success: false, error: "Cannot delete contractor with funded milestones on any project. Complete or reassign that work first." };
      }

      newState.contractors = newState.contractors.filter(c => c.id !== contractorId);
      const entry = createLedgerEntry({ projectId: "system", type: "CONTRACTOR_DELETED", amount: 0n, payeeId: contractorId });
      events.push(entry);
      newState.ledger.push(entry);
      break;
    }
    case "DELETE_PROJECT": {
      const { projectId } = command.payload;
      const projectIdx = newState.projects.findIndex(p => p.id === projectId);
      if (projectIdx === -1) return { success: false, error: "Project not found" };
      const project = newState.projects[projectIdx];

      if (project.milestones.some(m => m.funded)) {
        return { success: false, error: "Cannot delete project with funded milestones. Settle or reverse funds first." };
      }

      newState.projects = newState.projects.filter(p => p.id !== projectId);
      const entry = createLedgerEntry({ projectId, type: "PROJECT_DELETED", amount: 0n });
      events.push(entry);
      newState.ledger.push(entry);
      break;
    }

    default:
      return { success: false, error: "Unknown command" };
  }

  try { assertConservation(newState.economy); } catch (err) { return { success: false, error: String(err) } };
  return { success: true, state: newState, events };
}

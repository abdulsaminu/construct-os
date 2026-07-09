import { STAGE_ORDER, getStageOrder } from './execution-helpers.js';

export interface Milestone {
  id: string;
  name: string;
  budget: bigint;
  funded: boolean;
  claimed: boolean;
  settled: boolean;
  payeeId?: string;
  claimedAt?: number;
}

export interface Project {
  id: string;
  name: string;
  totalBudget: bigint;
  milestones: Milestone[];
  status: "draft" | "active" | "completed" | "at_risk";
  createdAt: number;
  completedAt?: number;
  estimatedDurationDays: number;
  plannedStartDate?: number;
  plannedFinishDate?: number;
}

export interface Contractor {
  id: string;
  name: string;
  payoutAddress: string;
  registeredAt: number;
}

function getMilestoneDurationMonths(name: string): number {
  const n = name.toLowerCase();
  if (n.includes('foundation') || n.includes('footing')) return 2;
  if (n.includes('substructure') || n.includes('ground floor') || n.includes('first floor') || n.includes('second floor') || n.includes('superstructure') || n.includes('pent')) return 3;
  if (n.includes('roofing') || n.includes('mep')) return 2.5;
  if (n.includes('finishing') || n.includes('finishes')) return 3;
  if (n.includes('fence') || n.includes('landscaping')) return 1.5;
  return 2;
}

export function createProject(params: {
  name: string;
  totalBudget: bigint;
  milestones: Omit<Milestone, "id" | "funded" | "claimed" | "settled">[];
  plannedStartDate?: number;
  plannedFinishDate?: number;
}): Project {
  const totalMilestoneBudget = params.milestones.reduce((sum, m) => sum + m.budget, 0n);
  if (totalMilestoneBudget !== params.totalBudget) {
    throw new Error(`Milestone budgets must sum to totalBudget`);
  }
  
  let estimatedDurationDays: number;
  if (params.plannedStartDate && params.plannedFinishDate) {
    estimatedDurationDays = Math.max(1, Math.round((params.plannedFinishDate - params.plannedStartDate) / (1000 * 60 * 60 * 24)));
  } else {
    estimatedDurationDays = Math.round(params.milestones.reduce((sum, m) => sum + getMilestoneDurationMonths(m.name), 0) * 30);
  }

  return {
    id: crypto.randomUUID(),
    name: params.name,
    totalBudget: params.totalBudget,
    status: "draft",
    createdAt: params.plannedStartDate || Date.now(),
    estimatedDurationDays,
    plannedStartDate: params.plannedStartDate,
    plannedFinishDate: params.plannedFinishDate,
    milestones: params.milestones.map(m => ({ ...m, id: crypto.randomUUID(), funded: false, claimed: false, settled: false })),
  };
}

export function createContractor(params: { name: string; payoutAddress: string }): Contractor {
  return { id: crypto.randomUUID(), ...params, registeredAt: Date.now() };
}

export { STAGE_ORDER, getStageOrder };

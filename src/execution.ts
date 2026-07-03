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
}

export interface Contractor {
  id: string;
  name: string;
  payoutAddress: string;
  registeredAt: number;
}

export function createProject(params: {
  name: string;
  totalBudget: bigint;
  milestones: Omit<Milestone, "id" | "funded" | "claimed" | "settled">[];
}): Project {
  const totalMilestoneBudget = params.milestones.reduce((sum, m) => sum + m.budget, 0n);
  if (totalMilestoneBudget !== params.totalBudget) {
    throw new Error(`Milestone budgets must sum to totalBudget`);
  }
  return {
    id: crypto.randomUUID(),
    name: params.name,
    totalBudget: params.totalBudget,
    status: "draft",
    createdAt: Date.now(),
    milestones: params.milestones.map(m => ({ ...m, id: crypto.randomUUID(), funded: false, claimed: false, settled: false })),
  };
}

export function createContractor(params: { name: string; payoutAddress: string }): Contractor {
  return { id: crypto.randomUUID(), ...params, registeredAt: Date.now() };
}

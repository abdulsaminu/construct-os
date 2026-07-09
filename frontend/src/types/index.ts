export interface Economy {
  totalCapital: string;
  availableCapital: string;
  lockedCapital: string;
  settledCapital: string;
}

export interface Milestone {
  id: string;
  name: string;
  budget: string;
  funded: boolean;
  claimed: boolean;
  settled: boolean;
  payeeId?: string;
  claimedAt?: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  totalBudget: string;
  status: 'draft' | 'active' | 'completed' | 'at_risk';
  createdAt: number;
  completedAt?: number;
  estimatedDurationDays: number;
  plannedStartDate?: number;
  plannedFinishDate?: number;
  milestones: Milestone[];
}

export interface AssignedProject {
  id: string;
  name: string;
  status: string;
  totalBudget: string;
  completionPercent: number;
  currentMilestone: string;
  assignmentDate: number;
}

export interface Contractor {
  id: string;
  name: string;
  payoutAddress: string;
  registeredAt: number;
  assignedProjects?: AssignedProject[];
}

export interface LedgerEntry {
  id: string;
  projectId: string;
  type: 'CAPITAL_DEPOSIT' | 'PROJECT_CREATED' | 'CONTRACTOR_ASSIGNED' | 'MILESTONE_FUNDED' | 'MILESTONE_CLAIMED' | 'SETTLEMENT' | 'PROJECT_CLOSED' | 'PROJECT_DELETED' | 'CAPITAL_RELEASED';
  amount: string;
  timestamp: number;
  payeeId?: string;
  milestoneId?: string;
  metadata?: {
    txHash?: string;
    blockNumber?: number;
    gasUsed?: string;
    milestoneName?: string;
    contractorName?: string;
    settlementMode?: 'real' | 'demo';
    demoReason?: string;
    confirmedAt?: number;
  };
}

export interface RiskScore {
  scheduleRisk: number;
  liquidityRisk: number;
  fundingRisk: number;
  contractorRisk: number;
  composite: number;
  healthStatus?: 'healthy' | 'at_risk' | 'delayed' | 'completed';
  scheduleVariance?: number;
  expectedProgress?: number;
  actualProgress?: number;
  daysElapsed?: number;
  daysRemaining?: number;
  deliveryConfidence?: number;
  plannedStartDate?: number;
  plannedFinishDate?: number;
  totalDurationDays?: number;
}

export interface AllocationRecommendation {
  projectId: string;
  projectName: string;
  score: number;
  recommendation: 'fund' | 'watch' | 'hold' | 'skip';
  requestableCap: string;
  reason: string;
}

export interface ForecastData {
  cash: {
    days: number[];
    available: string[];
    locked: string[];
    settled: string[];
  };
  settlement: {
    totalSettled: string;
    byProject: Record<string, string>;
  };
}

export interface ProjectForecast {
  completionDays: number | null;
  confidence: number;
  reason: string;
}

export interface ServiceStatus {
  name: string;
  status: 'Healthy' | 'Warning' | 'Offline' | 'Syncing';
  latency: string;
}

// Arc Testnet Explorer URL helper
export const getArcExplorerTxUrl = (txHash: string): string => {
  return `https://explorer.testnet.arc.network/tx/${txHash}`;
};

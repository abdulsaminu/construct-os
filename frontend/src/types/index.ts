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
  totalBudget: string;
  status: 'draft' | 'active' | 'completed' | 'at_risk';
  createdAt: number;
  completedAt?: number;
  milestones: Milestone[];
}

export interface Contractor {
  id: string;
  name: string;
  payoutAddress: string;
  registeredAt: number;
}

export interface LedgerEntry {
  id: string;
  projectId: string;
  type: 'CAPITAL_DEPOSIT' | 'MILESTONE_FUNDED' | 'MILESTONE_CLAIMED' | 'SETTLEMENT';
  amount: string;
  timestamp: number;
  payeeId?: string;
  milestoneId?: string;
  metadata?: {
    txHash?: string;
    blockNumber?: number;
    gasUsed?: string;
    milestoneName?: string;
  };
}

export interface RiskScore {
  scheduleRisk: number;
  liquidityRisk: number;
  fundingRisk: number;
  contractorRisk: number;
  composite: number;
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
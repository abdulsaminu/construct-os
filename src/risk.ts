import { CFELState } from './engine.js';
import { Project } from './execution.js';

export interface RiskScores {
  scheduleRisk: number;
  liquidityRisk: number;
  fundingRisk: number;
  contractorRisk: number;
  composite: number;
  healthStatus: 'healthy' | 'at_risk' | 'delayed' | 'completed';
  scheduleVariance: number;
  expectedProgress: number;
  actualProgress: number;
  daysElapsed: number;
  daysRemaining: number;
  deliveryConfidence: number;
  // NEW: Planned schedule fields for dashboard
  plannedStartDate?: number;
  plannedFinishDate?: number;
  totalDurationDays: number;
}

export function scoreProjectRisk(project: Project, state: CFELState): RiskScores {
  const funded = project.milestones.filter(m => m.funded).length;
  const claimed = project.milestones.filter(m => m.claimed || m.settled).length;
  const total = project.milestones.length || 1;

  // Legacy Calculations (Preserved)
  const scheduleScore = (funded / total) * 100;
  const projectLocked = project.milestones.filter(m => m.funded && !m.settled).reduce((s, m) => s + m.budget, 0n);
  const totalLocked = state.economy.lockedCapital;
  const liquidityScore = totalLocked > 0n ? Number((projectLocked * 100n) / totalLocked) : 0;
  const fundingScore = project.status === 'completed' ? 0 : (1 - (funded / total)) * 100;
  const assignedBudget = project.milestones.filter(m => m.payeeId).reduce((s, m) => s + m.budget, 0n);
  const contractorScore = project.totalBudget > 0n ? 100 - Number((assignedBudget * 100n) / project.totalBudget) : 0;
  const composite = (scheduleScore * 0.3) + (liquidityScore * 0.2) + (fundingScore * 0.3) + (contractorScore * 0.2);

  // IMPROVED: Time-Based Health Engine
  // Use planned dates if available, otherwise fall back to estimated duration
  let totalDurationDays: number;
  let startDate: number;

  if (project.plannedStartDate && project.plannedFinishDate) {
    totalDurationDays = Math.max(1, Math.round((project.plannedFinishDate - project.plannedStartDate) / (1000 * 60 * 60 * 24)));
    startDate = project.plannedStartDate;
  } else {
    totalDurationDays = project.estimatedDurationDays || (total * 30);
    startDate = project.createdAt;
  }

  const now = Date.now();
  const daysElapsed = Math.max(0, Math.floor((now - startDate) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, totalDurationDays - daysElapsed);

  // Expected: Where we SHOULD be based on the clock
  const expectedProgress = totalDurationDays > 0 ? Math.min(100, (daysElapsed / totalDurationDays) * 100) : 0;

  // Actual: Where we ACTUALLY are based on verified work (claims)
  const actualProgress = (claimed / total) * 100;

  // Variance: Positive = Ahead of schedule, Negative = Behind schedule
  const scheduleVariance = actualProgress - expectedProgress;

  // Determine Health Status
  let healthStatus: 'healthy' | 'at_risk' | 'delayed' | 'completed' = 'healthy';
  if (project.status === 'completed') {
    healthStatus = 'completed';
  } else if (scheduleVariance < -20) {
    healthStatus = 'delayed';
  } else if (scheduleVariance < -10) {
    healthStatus = 'at_risk';
  }

  // Delivery Confidence: 100% if on track, drops if delayed
  const deliveryConfidence = project.status === 'completed' ? 100 : Math.max(0, Math.min(100, Math.round(100 + scheduleVariance)));

  return {
    scheduleRisk: Math.min(100, Math.round(scheduleScore)),
    liquidityRisk: Math.min(100, Math.round(liquidityScore)),
    fundingRisk: Math.min(100, Math.round(fundingScore)),
    contractorRisk: Math.min(100, Math.round(contractorScore)),
    composite: Math.min(100, Math.round(composite)),
    healthStatus,
    scheduleVariance: Math.round(scheduleVariance * 10) / 10,
    expectedProgress: Math.round(expectedProgress * 10) / 10,
    actualProgress: Math.round(actualProgress * 10) / 10,
    daysElapsed,
    daysRemaining,
    deliveryConfidence,
    plannedStartDate: project.plannedStartDate,
    plannedFinishDate: project.plannedFinishDate,
    totalDurationDays,
  };
}

export function scoreAllProjects(state: CFELState): Record<string, RiskScores> {
  return Object.fromEntries(state.projects.filter(p => p.status !== 'completed').map(p => [p.id, scoreProjectRisk(p, state)]));
}

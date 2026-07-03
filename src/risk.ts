import { CFELState } from './engine.js';
import { Project } from './execution.js';

export interface RiskScores { scheduleRisk: number; liquidityRisk: number; fundingRisk: number; contractorRisk: number; composite: number; }

export function scoreProjectRisk(project: Project, state: CFELState): RiskScores {
  const funded = project.milestones.filter(m => m.funded).length;
  const total = project.milestones.length || 1;
  
  const scheduleScore = (funded / total) * 100;
  
  // FIX: Safely calculate liquidity percentage without integer overflow or division by zero
  const projectLocked = project.milestones.filter(m => m.funded && !m.settled).reduce((s, m) => s + m.budget, 0n);
  const totalLocked = state.economy.lockedCapital;
  const liquidityScore = totalLocked > 0n ? Number((projectLocked * 100n) / totalLocked) : 0;

  const fundingScore = project.status === 'completed' ? 0 : (1 - (funded / total)) * 100;
  
  const assignedBudget = project.milestones.filter(m => m.payeeId).reduce((s, m) => s + m.budget, 0n);
  const contractorScore = project.totalBudget > 0n ? 100 - Number((assignedBudget * 100n) / project.totalBudget) : 0;

  const composite = (scheduleScore * 0.3) + (liquidityScore * 0.2) + (fundingScore * 0.3) + (contractorScore * 0.2);
  
  // Enforce 0-100 bounds on ALL individual metrics
  return { 
    scheduleRisk: Math.min(100, Math.round(scheduleScore)), 
    liquidityRisk: Math.min(100, Math.round(liquidityScore)), 
    fundingRisk: Math.min(100, Math.round(fundingScore)), 
    contractorRisk: Math.min(100, Math.round(contractorScore)), 
    composite: Math.min(100, Math.round(composite)) 
  };
}

export function scoreAllProjects(state: CFELState): Record<string, RiskScores> {
  return Object.fromEntries(state.projects.filter(p => p.status !== 'completed').map(p => [p.id, scoreProjectRisk(p, state)]));
}

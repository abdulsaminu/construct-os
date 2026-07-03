import { CFELState } from './engine.js';
import { getAvailableCapital } from './economy.js';
import { scoreProjectRisk } from './risk.js';

export interface AllocationRecommendation { projectId: string; projectName: string; score: number; recommendation: 'fund' | 'watch' | 'hold' | 'skip'; requestableCap: bigint; reason: string; }

export function rankAllocations(state: CFELState, options: { topN?: number; maxPerProject?: bigint }): AllocationRecommendation[] {
  const available = getAvailableCapital(state.economy);
  return state.projects.filter(p => p.status !== 'completed').map(project => {
    const risk = scoreProjectRisk(project, state);
    const score = Math.round((100 - risk.composite) * 0.6 + (project.milestones.filter(m=>m.funded).length / (project.milestones.length||1)) * 100 * 0.4);
    const remaining = project.totalBudget - project.milestones.filter(m => m.funded).reduce((s, m) => s + m.budget, 0n);
    const requestable = remaining < (options.maxPerProject || 0n) ? remaining : (options.maxPerProject || 0n);
    
    // Explicitly typed to prevent TS from widening to 'string'
    const recommendation: 'fund' | 'watch' | 'hold' | 'skip' = score > 70 && available >= requestable ? 'fund' : score > 50 ? 'watch' : score > 30 ? 'hold' : 'skip';
    
    return { projectId: project.id, projectName: project.name, score, recommendation, requestableCap: requestable, reason: `Score ${score}` };
  }).sort((a, b) => b.score - a.score).slice(0, options.topN || 10);
}

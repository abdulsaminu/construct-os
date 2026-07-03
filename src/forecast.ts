import { CFELState } from './engine.js';
import { Project } from './execution.js';
import { getAvailableCapital } from './economy.js';

export interface ProjectForecast { completionDays: number | null; confidence: number; reason: string; }

export function forecastProjectCompletion(project: Project): ProjectForecast {
  const progress = project.milestones.filter(m => m.funded).length / (project.milestones.length || 1);
  if (progress >= 1 || project.status === 'completed') return { completionDays: 0, confidence: 100, reason: 'Completed' };
  
  const ageDays = (Date.now() - project.createdAt) / (1000 * 60 * 60 * 24);
  if (ageDays < 1) return { completionDays: null, confidence: 20, reason: 'Too early' };
  
  const rate = progress / ageDays;
  return { completionDays: rate > 0 ? Math.round((1 - progress) / rate) : null, confidence: Math.min(100, Math.round(50 + (progress * 50))), reason: 'Linear extrapolation' };
}

export function forecastCash(state: CFELState, horizonDays: number) {
  const days: number[] = [];
  const available: bigint[] = [];
  for (let i = 0; i <= horizonDays; i += 7) {
    days.push(i);
    available.push(getAvailableCapital(state.economy)); // Stub: static projection
  }
  return { days, available, locked: Array(days.length).fill(state.economy.lockedCapital), settled: Array(days.length).fill(state.economy.settledCapital) };
}

export function forecastSettlement(state: CFELState, horizonDays: number) {
  return { totalSettled: state.economy.settledCapital, byProject: Object.fromEntries(state.projects.filter(p=>p.status==='completed').map(p => [p.id, p.milestones.filter(m => m.settled).reduce((s, m) => s + m.budget, 0n)])) };
}

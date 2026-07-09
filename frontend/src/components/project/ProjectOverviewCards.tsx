import React from 'react';
import { Project, RiskScore } from '../../types';
import { money } from '../../lib/api';
import { DollarSign, ListChecks, Activity, ShieldAlert, Calendar, Clock, TrendingUp } from 'lucide-react';

interface Props {
  project: Project;
  risk?: RiskScore;
}

export const ProjectOverviewCards: React.FC<Props> = ({ project, risk }) => {
  const fundedCount = project.milestones.filter(m => m.funded).length;

  const getRiskColor = (score: number) => {
    if (score > 80) return 'text-danger';
    if (score > 60) return 'text-warning';
    return 'text-success';
  };

  const getHealthColor = (status?: string) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'at_risk': return 'text-warning';
      case 'delayed': return 'text-danger';
      case 'completed': return 'text-primary';
      default: return 'text-text-dim';
    }
  };

  const getHealthLabel = (status?: string) => {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'at_risk': return 'At Risk';
      case 'delayed': return 'Delayed';
      case 'completed': return 'Completed';
      default: return 'N/A';
    }
  };

  const formatDays = (days?: number) => {
    if (days === undefined || days === null) return 'N/A';
    if (days === 0) return 'Today';
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <OverviewCard title="Total Budget" value={money(project.totalBudget)} icon={DollarSign} color="text-primary" />
      <OverviewCard 
        title="Health Status" 
        value={getHealthLabel(risk?.healthStatus)} 
        icon={TrendingUp} 
        color={getHealthColor(risk?.healthStatus)} 
      />
      <OverviewCard 
        title="Days Remaining" 
        value={formatDays(risk?.daysRemaining)} 
        icon={Clock} 
        color={risk?.daysRemaining !== undefined && risk.daysRemaining <= 7 ? 'text-warning' : 'text-text-main'} 
      />
      <OverviewCard
        title="Schedule Variance"
        value={risk?.scheduleVariance !== undefined ? `${risk.scheduleVariance > 0 ? '+' : ''}${risk.scheduleVariance}%` : 'N/A'}
        icon={Calendar}
        color={risk?.scheduleVariance !== undefined 
          ? (risk.scheduleVariance >= 0 ? 'text-success' : risk.scheduleVariance >= -10 ? 'text-warning' : 'text-danger')
          : 'text-text-dim'
        }
      />
    </div>
  );
};

const OverviewCard = ({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ElementType; color: string }) => (
  <div className="bg-elevated rounded-card p-4 flex items-center gap-4">
    <div className={`p-3 rounded-8 bg-surface ${color}`}><Icon size={24} /></div>
    <div>
      <p className="text-label text-text-dim">{title}</p>
      <p className={`text-body-lg font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  </div>
);

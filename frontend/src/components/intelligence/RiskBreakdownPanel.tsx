import React, { useState, useEffect } from 'react';
import { RiskScore } from '../../types';

interface Props {
  projectName: string;
  scores: RiskScore;
  defaultExpanded?: boolean;
}

const BREAKDOWN_ITEMS = [
  { key: 'scheduleRisk' as const, label: 'Schedule', description: 'Milestone completion progress' },
  { key: 'liquidityRisk' as const, label: 'Financial', description: 'Capital locked vs total exposure' },
  { key: 'fundingRisk' as const, label: 'Execution', description: 'Remaining unfunded milestones' },
  { key: 'contractorRisk' as const, label: 'Contractor', description: 'Budget assigned to payees' },
  { key: 'composite' as const, label: 'Composite', description: 'Weighted aggregate score' },
];

const getBarColor = (value: number) => {
  if (value > 80) return 'bg-danger';
  if (value > 60) return 'bg-warning';
  if (value > 30) return 'bg-primary';
  return 'bg-success';
};

const getRiskLevel = (value: number): string => {
  if (value > 80) return 'Critical';
  if (value > 60) return 'High';
  if (value > 30) return 'Medium';
  return 'Low';
};

export const RiskBreakdownPanel: React.FC<Props> = ({ projectName, scores, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Sync with parent-controlled defaultExpanded
  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  return (
    <div className="bg-elevated rounded-card border border-border-main p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center text-left"
        aria-expanded={isExpanded}
        aria-controls={`risk-breakdown-${projectName}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-body font-semibold text-text-main">{projectName}</span>
          <span className={`text-caption font-bold px-2 py-1 rounded ${
            scores.composite > 80 ? 'bg-danger/20 text-danger' :
            scores.composite > 60 ? 'bg-warning/20 text-warning' :
            scores.composite > 30 ? 'bg-primary/20 text-primary' :
            'bg-success/20 text-success'
          }`}>
            {getRiskLevel(scores.composite)}
          </span>
        </div>
        <span className="text-text-dim text-small">{isExpanded ? 'Collapse' : 'Expand'}</span>
      </button>

      {isExpanded && (
        <div id={`risk-breakdown-${projectName}`} className="mt-6 space-y-4 pt-6 border-t border-border-main">
          {BREAKDOWN_ITEMS.map(({ key, label, description }) => {
            const value = scores[key];
            return (
              <div key={key}>
                <div className="flex justify-between text-small mb-1">
                  <div>
                    <span className="text-text-muted">{label}</span>
                    <span className="text-text-dim text-caption ml-2">{description}</span>
                  </div>
                  <span className="font-bold text-text-main">{value}/100</span>
                </div>
                <div className="w-full bg-surface rounded-full h-2" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={`${label} risk: ${value} out of 100`}>
                  <div
                    className={`h-2 rounded-full transition-all duration-slow ${getBarColor(value)}`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
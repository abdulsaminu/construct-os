import React from 'react';
import { Project, Contractor } from '../../types';
import { User } from 'lucide-react';

interface Props {
  project: Project;
  contractors: Contractor[];
}

export const ContractorPanel: React.FC<Props> = ({ project, contractors }) => {
  const assignedIds = [...new Set(project.milestones.map(m => m.payeeId).filter(Boolean) as string[])];
  const assignedContractors = contractors.filter(c => assignedIds.includes(c.id));

  return (
    <div className="bg-surface rounded-card border border-border-main p-6">
      <h3 className="text-body-lg font-semibold text-text-main mb-4">Assigned Contractors</h3>
      {assignedContractors.length === 0 ? (
        <p className="text-small text-text-dim">No contractors assigned.</p>
      ) : (
        <div className="space-y-3">
          {assignedContractors.map(c => {
            const count = project.milestones.filter(m => m.payeeId === c.id).length;
            const claimed = project.milestones.filter(m => m.payeeId === c.id && m.claimed).length;
            const settled = project.milestones.filter(m => m.payeeId === c.id && m.settled).length;
            return (
              <div key={c.id} className="p-4 bg-elevated rounded-12">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-surface rounded-8 text-text-muted"><User size={16} /></div>
                  <div>
                    <p className="font-medium text-small text-text-main">{c.name}</p>
                    <p className="text-caption font-mono text-text-dim">{c.payoutAddress.slice(0, 10)}...</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-caption text-center mt-3 border-t border-border-main pt-3">
                  <div><p className="text-text-main font-bold">{count}</p><p className="text-text-dim">Milestones</p></div>
                  <div><p className="text-primary font-bold">{claimed}</p><p className="text-text-dim">Claimed</p></div>
                  <div><p className="text-success font-bold">{settled}</p><p className="text-text-dim">Settled</p></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

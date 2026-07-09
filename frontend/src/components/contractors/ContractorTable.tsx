import React, { useMemo, useState, useEffect } from 'react';
import { Contractor } from '../../types';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { CopyButton } from '../ui/CopyButton';
import { deleter } from '../../lib/api';
import { User, Briefcase, CheckCircle, Trash2 } from 'lucide-react';

interface Props {
  contractors: Contractor[];
  onSelect: (c: Contractor) => void;
}

// Phase 6: Safely extract AI metrics from Phase 2 mapped data
function getContractorMetrics(contractor: Contractor) {
  const projects = (contractor as any).assignedProjects || [];
  const activeProject = projects.find((p: any) => p.status === 'active');
  const completedCount = projects.filter((p: any) => p.status === 'completed').length;
  return { activeProject, completedCount, totalProjects: projects.length };
}

export const ContractorTable: React.FC<Props> = ({ contractors, onSelect }) => {
  // Local copy so a delete can remove a row immediately without depending
  // on the parent page's refetch pattern (not available to wire into here).
  const [rows, setRows] = useState<Contractor[]>(contractors);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRows(contractors);
  }, [contractors]);

  const handleDelete = async (contractor: Contractor, e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);

    if (!window.confirm(`Delete "${contractor.name}"? This cannot be undone. (Contractors with funded milestones on any project cannot be deleted.)`)) {
      return;
    }

    setDeletingId(contractor.id);
    try {
      const res = await deleter<{ error?: string }>(`/contractors/${contractor.id}`);
      if (res?.error) {
        setError(res.error);
      } else {
        setRows(prev => prev.filter(c => c.id !== contractor.id));
      }
    } catch {
      setError('Failed to delete contractor.');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo(() => [
    { key: 'status', header: 'Status', render: (row: Contractor) => <Badge text="Registered" color="bg-success/20 text-success" /> },
    { key: 'company', header: 'Company', render: (row: Contractor) => (
      <button onClick={() => onSelect(row)} className="flex items-center gap-3 text-left hover:text-primary transition-colors">
        <div className="p-2 bg-elevated rounded-8 text-text-muted"><User size={16} /></div>
        <div>
          <p className="font-medium text-text-main">{row.name}</p>
          <p className="text-caption text-text-dim">Primary Contractor</p>
        </div>
      </button>
    )},
    { key: 'wallet', header: 'Wallet', render: (row: Contractor) => (
      <div className="flex items-center gap-2">
        <span className="font-mono text-caption text-text-muted">{row.payoutAddress.slice(0, 6)}...{row.payoutAddress.slice(-4)}</span>
        <CopyButton text={row.payoutAddress} />
      </div>
    )},
    { key: 'date', header: 'Registered', render: (row: Contractor) => <span className="text-small text-text-muted">{new Date(row.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
    { key: 'projects', header: 'Project Status', render: (row: Contractor) => {
      const { activeProject, completedCount } = getContractorMetrics(row);
      return (
        <div className="text-small">
          {activeProject ? (
            <div>
              <div className="flex items-center gap-2 text-text-main font-medium">
                <Briefcase size={14} className="text-primary" />
                {activeProject.name}
              </div>
              <p className="text-caption text-text-dim mt-1">Current: {activeProject.currentMilestone} · {activeProject.completionPercent}%</p>
            </div>
          ) : (
            <p className="text-text-dim">No active projects</p>
          )}
          {completedCount > 0 && (
            <div className="flex items-center gap-1.5 text-success mt-2">
              <CheckCircle size={12} />
              <span className="text-caption font-medium">{completedCount} Completed</span>
            </div>
          )}
        </div>
      );
    }},
    { key: 'actions', header: '', render: (row: Contractor) => (
      <button
        onClick={(e) => handleDelete(row, e)}
        disabled={deletingId === row.id}
        className="p-2 text-text-dim hover:text-danger hover:bg-danger/10 rounded-8 transition-colors disabled:opacity-50"
        aria-label={`Delete contractor ${row.name}`}
        title="Delete contractor"
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    )},
  ], [deletingId]);

  return (
    <div>
      {error && <p className="text-caption text-danger mb-3">{error}</p>}
      <Table columns={columns} data={rows} emptyMessage="No contractors found." />
    </div>
  );
};

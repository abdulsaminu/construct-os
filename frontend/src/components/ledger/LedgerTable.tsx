import React from 'react';
import { LedgerEntry } from '../../types';
import { Table } from '../ui/Table';
import { CopyButton } from '../ui/CopyButton';
import { money } from '../../lib/api';
import { CheckCircle } from 'lucide-react';

interface Props {
  entries: LedgerEntry[];
  onSelect: (e: LedgerEntry) => void;
}

export const LedgerTable: React.FC<Props> = ({ entries, onSelect }) => {
  const getEventColor = (type: string) => {
    switch(type) {
      case 'CAPITAL_DEPOSIT': return 'text-primary bg-primary/10';
      case 'MILESTONE_FUNDED': return 'text-warning bg-warning/10';
      case 'MILESTONE_CLAIMED': return 'text-purple-400 bg-purple-400/10';
      case 'SETTLEMENT': return 'text-success bg-success/10';
      default: return 'text-text-dim bg-white/5';
    }
  };

  const columns = [
    { key: 'status', header: 'Status', render: (row: LedgerEntry) => row.metadata?.txHash ? (
      <span className="flex items-center gap-1 text-success text-caption font-semibold"><CheckCircle size={16} /> Confirmed</span>
    ) : (
      <span className="text-text-dim text-caption">Local</span>
    )},
    { key: 'time', header: 'Timestamp', render: (row: LedgerEntry) => <span className="text-caption text-text-muted whitespace-nowrap">{new Date(row.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span> },
    { key: 'project', header: 'Project', render: (row: LedgerEntry) => <span className="text-small text-text-muted">{row.projectId === 'system' ? 'System Treasury' : '—'}</span> },
    { key: 'milestone', header: 'Milestone', render: (row: LedgerEntry) => <span className="text-small text-text-muted">{row.metadata?.milestoneName || '—'}</span> },
    { key: 'event', header: 'Event', render: (row: LedgerEntry) => <span className={`text-caption font-bold uppercase px-2 py-1 rounded ${getEventColor(row.type)}`}>{row.type.replace(/_/g, ' ')}</span> },
    { key: 'contractor', header: 'Contractor', render: () => <span className="text-small text-text-dim">—</span> }, // Needs join
    { key: 'amount', header: 'Amount', align: 'right' as const, render: (row: LedgerEntry) => <span className="text-small font-medium text-text-main">{row.amount !== '0' ? money(row.amount) : '—'}</span> },
    { key: 'tx', header: 'Transaction', render: (row: LedgerEntry) => row.metadata?.txHash ? (
      <div className="flex items-center gap-1"><span className="font-mono text-caption text-primary">{row.metadata.txHash.slice(0, 10)}...</span><CopyButton text={row.metadata.txHash} /></div>
    ) : <span className="text-text-dim text-caption">—</span> },
    { key: 'block', header: 'Block', render: (row: LedgerEntry) => <span className="text-caption text-text-muted font-mono">{row.metadata?.blockNumber || '—'}</span> },
    { key: 'actions', header: '', render: (row: LedgerEntry) => (
      <button onClick={() => onSelect(row)} className="text-caption text-primary hover:underline">Details</button>
    )}
  ];

  return <Table columns={columns} data={entries} emptyMessage="No events recorded." />;
};

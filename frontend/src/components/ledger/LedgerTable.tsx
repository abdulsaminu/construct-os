import React, { useMemo } from 'react';
import { LedgerEntry, getArcExplorerTxUrl } from '../../types';
import { Table } from '../ui/Table';
import { CopyButton } from '../ui/CopyButton';
import { money } from '../../lib/api';
import { CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';

interface Props {
  entries: LedgerEntry[];
  onSelect: (e: LedgerEntry) => void;
}

export const LedgerTable: React.FC<Props> = ({ entries, onSelect }) => {
  const getEventColor = (type: string) => {
    switch(type) {
      case 'CAPITAL_DEPOSIT': return 'text-primary bg-primary/10';
      case 'MILESTONE_FUNDED': return 'text-warning bg-warning/10';
      case 'MILESTONE_CLAIMED': return 'text-info bg-info/10';
      case 'SETTLEMENT': return 'text-success bg-success/10';
      case 'PROJECT_CREATED': return 'text-primary bg-primary/10';
      case 'PROJECT_CLOSED': return 'text-success bg-success/10';
      case 'PROJECT_DELETED': return 'text-danger bg-danger/10';
      case 'CONTRACTOR_ASSIGNED': return 'text-info bg-info/10';
      default: return 'text-text-dim bg-elevated';
    }
  };

  const columns = useMemo(() => [
    { 
      key: 'status', 
      header: 'Status', 
      render: (row: LedgerEntry) => {
        if (row.type !== 'SETTLEMENT') {
          return <span className="text-text-dim text-caption">Local</span>;
        }
        
        if (row.metadata?.settlementMode === 'real') {
          return (
            <span className="flex items-center gap-1 text-success text-caption font-semibold">
              <CheckCircle aria-hidden='true' size={16} /> On-Chain
            </span>
          );
        }
        
        if (row.metadata?.settlementMode === 'demo') {
          return (
            <span className="flex items-center gap-1 text-warning text-caption font-semibold" title={row.metadata?.demoReason}>
              <AlertCircle aria-hidden='true' size={16} /> Demo
            </span>
          );
        }
        
        return row.metadata?.txHash ? (
          <span className="flex items-center gap-1 text-success text-caption font-semibold">
            <CheckCircle aria-hidden='true' size={16} /> Confirmed
          </span>
        ) : (
          <span className="text-text-dim text-caption">Pending</span>
        );
      }
    },
    { 
      key: 'time', 
      header: 'Timestamp', 
      render: (row: LedgerEntry) => {
        const time = row.metadata?.confirmedAt || row.timestamp;
        return <span className="text-caption text-text-muted whitespace-nowrap">{new Date(time).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>;
      }
    },
    { key: 'project', header: 'Project', render: (row: any) => <span className="text-small text-text-muted">{row.projectId === 'system' ? 'System Treasury' : row.projectName || '—'}</span> },
    { key: 'milestone', header: 'Milestone', render: (row: LedgerEntry) => <span className="text-small text-text-muted">{row.metadata?.milestoneName || '—'}</span> },
    { key: 'event', header: 'Event', render: (row: LedgerEntry) => <span className={`text-caption font-bold uppercase px-2 py-1 rounded ${getEventColor(row.type)}`}>{row.type.replace(/_/g, ' ')}</span> },
    { key: 'contractor', header: 'Contractor', render: (row: any) => <span className="text-small text-text-muted">{row.metadata?.contractorName || '—'}</span> },
    { key: 'amount', header: 'Amount', align: 'right' as const, render: (row: LedgerEntry) => <span className="text-small font-medium text-text-main">{row.amount !== '0' ? money(row.amount) : '—'}</span> },
    { 
      key: 'tx', 
      header: 'Transaction', 
      render: (row: LedgerEntry) => {
        if (!row.metadata?.txHash) {
          return <span className="text-text-dim text-caption">—</span>;
        }
        
        const isReal = row.metadata?.settlementMode === 'real';
        const txHash = row.metadata.txHash;
        const shortHash = `${txHash.slice(0, 10)}...${txHash.slice(-6)}`;
        
        if (isReal) {
          return (
            <a 
              href={getArcExplorerTxUrl(txHash)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-mono text-caption text-primary hover:text-primary-hover transition-colors"
              title="View on Arc Explorer"
            >
              {shortHash}
              <ExternalLink size={12} />
            </a>
          );
        }
        
        return (
          <div className="flex items-center gap-1">
            <span className="font-mono text-caption text-text-muted">{shortHash}</span>
            <CopyButton text={txHash} />
          </div>
        );
      }
    },
    { key: 'block', header: 'Block', render: (row: LedgerEntry) => <span className="text-caption text-text-muted font-mono">{row.metadata?.blockNumber || '—'}</span> },
    { key: 'actions', header: '', render: (row: LedgerEntry) => (
      <button onClick={() => onSelect(row)} className="text-caption text-primary hover:underline">Details</button>
    )}
  ], []);

  return <Table columns={columns} data={entries} emptyMessage="No events recorded." />;
};

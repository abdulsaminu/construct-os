import React, { useMemo } from 'react';
import { LedgerEntry } from '../../types';
import { Table } from '../ui/Table';
import { TableSkeleton } from '../ui/Skeleton';
import { money } from '../../lib/api';
import { CheckCircle, ExternalLink } from 'lucide-react';

interface Props {
  ledger: LedgerEntry[];
  isLoading: boolean;
}

export const ProjectLedger: React.FC<Props> = ({ ledger, isLoading }) => {
  const columns = useMemo(() => [
 { key: 'time', header: 'Timestamp', render: (row: any) => <span className="text-text-dim text-caption whitespace-nowrap">{new Date(row.timestamp).toLocaleString()}</span> },
 { key: 'event', header: 'Event', render: (row: any) => <span className="font-mono text-caption text-text-muted uppercase">{row.type.replace(/_/g, ' ')}</span> },
 { key: 'milestone', header: 'Milestone', render: (row: any) => <span className="text-small text-text-muted">{row.metadata?.milestoneName || '-'}</span> },
 { key: 'amount', header: 'Amount', align: 'right' as const, render: (row: any) => <span className="text-small font-medium">{row.amount !== '0' ? money(row.amount) : '-'}</span> },
    { key: 'tx', header: 'Transaction', render: (row: any) => row.metadata?.txHash ? (
 <a href={`#`} className="flex items-center gap-1 text-primary text-caption font-mono hover:underline"><ExternalLink size={16}/>{row.metadata.txHash.slice(0, 10)}...</a>
 ) : <span className="text-text-dim text-caption">-</span> },
    { key: 'status', header: 'Status', render: (row: any) => row.metadata?.txHash ? (
 <span className="flex items-center gap-1 text-success text-caption font-semibold"><CheckCircle size={16} /> Confirmed</span>
    ) : (
 <span className="text-text-dim text-caption">Local</span>
    )}
  ], []);

  return (
 <div className="bg-surface rounded-card border border-border-main p-6">
 <h3 className="text-h3 text-text-main mb-4">Financial Ledger</h3>
      {isLoading ? <TableSkeleton rows={5} /> : <Table columns={columns} data={ledger} emptyMessage="No ledger entries." />}
    </div>
  );
};

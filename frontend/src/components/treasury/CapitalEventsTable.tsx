import React, { useMemo } from 'react';
import { LedgerEntry } from '../../types';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { Table } from '../ui/Table';
import { TableSkeleton } from '../ui/Skeleton';
import { money } from '../../lib/api';
import { CheckCircle } from 'lucide-react';

interface Props {
  entries: (LedgerEntry & { projectName?: string })[];
  isLoading: boolean;
}

export const CapitalEventsTable: React.FC<Props> = ({ entries, isLoading }) => {
  const columns = useMemo(() => [
 { key: 'event', header: 'Event', render: (row: any) => <span className="font-mono text-caption text-text-muted uppercase">{row.type.replace(/_/g, ' ')}</span> },
 { key: 'amount', header: 'Amount', align: 'right' as const, render: (row: any) => <span className="font-medium">{row.amount !== '0' ? money(row.amount) : '-'}</span> },
 { key: 'project', header: 'Project', render: (row: any) => <span className="text-text-muted">{row.projectName || 'System'}</span> },
    { key: 'status', header: 'Status', render: (row: any) => (
      row.metadata?.txHash ? (
 <span className="flex items-center gap-1 text-success text-caption font-semibold"><CheckCircle size={16} /> Confirmed</span>
      ) : (
 <span className="text-text-dim text-caption">Pending</span>
      )
    )},
 { key: 'time', header: 'Time', align: 'right' as const, render: (row: any) => <span className="text-text-dim text-caption">{new Date(row.timestamp).toLocaleString()}</span> },
  ], []);

  return (
 <Panel className="lg:col-span-8 col-span-12">
      <SectionHeader title="Recent Capital Events" />
 <div className="mt-6">
        {isLoading ? <TableSkeleton rows={6} /> : <Table columns={columns} data={entries.slice(0, 12)} emptyMessage="No treasury activity recorded." />}
      </div>
    </Panel>
  );
};

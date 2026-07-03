import React, { useMemo } from 'react';
import { Contractor } from '../../types';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { CopyButton } from '../ui/CopyButton';
import { User } from 'lucide-react';

interface Props {
  contractors: Contractor[];
  onSelect: (c: Contractor) => void;
}

export const ContractorTable: React.FC<Props> = ({ contractors, onSelect }) => {
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
 { key: 'projects', header: 'Projects', render: () => <span className="text-small text-text-dim">—</span> }, // Backend doesn't expose count yet
  ], []);

  return <Table columns={columns} data={contractors} emptyMessage="No contractors found." />;
};

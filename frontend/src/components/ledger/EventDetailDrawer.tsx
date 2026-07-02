import React from 'react';
import { LedgerEntry } from '../../types';
import { Drawer } from '../ui/Drawer';
import { CopyButton } from '../ui/CopyButton';
import { money } from '../../lib/api';
import { FileText } from 'lucide-react';

interface Props {
  entry: LedgerEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetailDrawer: React.FC<Props> = ({ entry, isOpen, onClose }) => {
  if (!entry) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Event Details">
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-text-main mb-4 uppercase tracking-wide flex items-center gap-2"><FileText size={16} /> Overview</h4>
          <div className="bg-elevated rounded-xl p-4 space-y-3 text-sm">
            <Row label="Event Type" value={entry.type.replace(/_/g, ' ')} />
            <Row label="Amount" value={entry.amount !== '0' ? money(entry.amount) : '—'} />
            <Row label="Timestamp" value={new Date(entry.timestamp).toLocaleString()} />
            <Row label="Project ID" value={entry.projectId} isMono />
            <Row label="Milestone ID" value={entry.milestoneId || '—'} isMono />
          </div>
        </div>

        {entry.metadata?.txHash && (
          <div>
            <h4 className="text-sm font-semibold text-text-main mb-4 uppercase tracking-wide">Blockchain</h4>
            <div className="bg-elevated rounded-xl p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-dim">Tx Hash</span>
                <div className="flex items-center gap-2"><span className="font-mono text-primary text-xs">{entry.metadata.txHash}</span><CopyButton text={entry.metadata.txHash} /></div>
              </div>
              <Row label="Block" value={String(entry.metadata.blockNumber || '—')} />
              <Row label="Gas Used" value={entry.metadata.gasUsed ? entry.metadata.gasUsed : '—'} />
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-text-main mb-4 uppercase tracking-wide">Raw JSON</h4>
          <pre className="bg-elevated rounded-xl p-4 text-xs text-text-muted overflow-x-auto font-mono whitespace-pre-wrap break-words">
            {JSON.stringify(entry, null, 2)}
          </pre>
        </div>
      </div>
    </Drawer>
  );
};

const Row = ({ label, value, isMono }: { label: string; value: string; isMono?: boolean }) => (
  <div className="flex justify-between">
    <span className="text-text-dim">{label}</span>
    <span className={`text-text-main ${isMono ? 'font-mono text-xs' : ''}`}>{value}</span>
  </div>
);

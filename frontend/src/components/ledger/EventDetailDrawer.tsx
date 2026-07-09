import React from 'react';
import { LedgerEntry, getArcExplorerTxUrl } from '../../types';
import { Drawer } from '../ui/Drawer';
import { CopyButton } from '../ui/CopyButton';
import { money } from '../../lib/api';
import { FileText, ExternalLink, CheckCircle, AlertCircle, Link as LinkIcon } from 'lucide-react';

interface Props {
  entry: LedgerEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetailDrawer: React.FC<Props> = ({ entry, isOpen, onClose }) => {
  if (!entry) return null;

  const isRealSettlement = entry.type === 'SETTLEMENT' && entry.metadata?.settlementMode === 'real';
  const isDemoSettlement = entry.type === 'SETTLEMENT' && entry.metadata?.settlementMode === 'demo';

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Event Details">
      <div className="space-y-6">
        {/* Settlement Status Banner */}
        {entry.type === 'SETTLEMENT' && (
          <div className={`flex items-center gap-3 p-4 rounded-card border ${
            isRealSettlement 
              ? 'bg-success/10 border-success/30' 
              : isDemoSettlement 
                ? 'bg-warning/10 border-warning/30' 
                : 'bg-elevated border-border-main'
          }`}>
            {isRealSettlement ? (
              <CheckCircle size={20} className="text-success" />
            ) : isDemoSettlement ? (
              <AlertCircle size={20} className="text-warning" />
            ) : (
              <FileText size={20} className="text-text-dim" />
            )}
            <div>
              <p className="text-small font-medium text-text-main">
                {isRealSettlement ? 'On-Chain Settlement Confirmed' : isDemoSettlement ? 'Demo Mode Settlement' : 'Settlement'}
              </p>
              {isDemoSettlement && entry.metadata?.demoReason && (
                <p className="text-caption text-text-muted mt-0.5">{entry.metadata.demoReason}</p>
              )}
              {isRealSettlement && (
                <p className="text-caption text-text-muted mt-0.5">USDC transferred on Arc Testnet</p>
              )}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-small font-semibold text-text-main mb-4 uppercase tracking-wide flex items-center gap-2">
            <FileText size={16} /> Overview
          </h4>
          <div className="bg-elevated rounded-card p-4 space-y-3 text-small">
            <Row label="Event Type" value={entry.type.replace(/_/g, ' ')} />
            <Row label="Amount" value={entry.amount !== '0' ? money(entry.amount) : '—'} />
            <Row label="Timestamp" value={new Date(entry.metadata?.confirmedAt || entry.timestamp).toLocaleString()} />
            <Row label="Project ID" value={entry.projectId} isMono />
            <Row label="Milestone ID" value={entry.milestoneId || '—'} isMono />
            {entry.metadata?.contractorName && (
              <Row label="Contractor" value={entry.metadata.contractorName} />
            )}
            {entry.metadata?.milestoneName && (
              <Row label="Milestone" value={entry.metadata.milestoneName} />
            )}
          </div>
        </div>

        {entry.metadata?.txHash && (
          <div>
            <h4 className="text-small font-semibold text-text-main mb-4 uppercase tracking-wide flex items-center gap-2">
              <LinkIcon size={16} /> Blockchain
            </h4>
            <div className="bg-elevated rounded-card p-4 space-y-3 text-small">
              <div>
                <span className="text-text-dim block mb-2">Tx Hash</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-primary text-caption break-all flex-1">{entry.metadata.txHash}</span>
                  <CopyButton text={entry.metadata.txHash} />
                  {isRealSettlement && (
                    <a
                      href={getArcExplorerTxUrl(entry.metadata.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:text-primary-hover transition-colors p-1.5 bg-primary/10 rounded-btn"
                      title="View on Arc Explorer"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
              <Row label="Block" value={String(entry.metadata.blockNumber || '—')} />
              <Row label="Gas Used" value={entry.metadata.gasUsed ? `${entry.metadata.gasUsed} gas units` : '—'} />
              {isRealSettlement && (
                <div className="pt-2 border-t border-border-main">
                  <a
                    href={getArcExplorerTxUrl(entry.metadata.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary-hover text-caption font-medium transition-colors"
                  >
                    <ExternalLink size={14} />
                    View Transaction on Arc Explorer
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-small font-semibold text-text-main mb-4 uppercase tracking-wide">Raw JSON</h4>
          <pre className="bg-elevated rounded-card p-4 text-caption text-text-muted overflow-x-auto font-mono whitespace-pre-wrap break-words">
            {JSON.stringify(entry, null, 2)}
          </pre>
        </div>
      </div>
    </Drawer>
  );
};

const Row = ({ label, value, isMono }: { label: string; value: string; isMono?: boolean }) => (
  <div className="flex justify-between gap-4">
    <span className="text-text-dim whitespace-nowrap">{label}</span>
    <span className={`text-text-main text-right ${isMono ? 'font-mono text-caption' : ''}`}>{value}</span>
  </div>
);

import React from 'react';
import { LedgerEntry } from '../../types';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { money } from '../../lib/api';
import { CheckCircle } from 'lucide-react';

interface Props {
  entries: (LedgerEntry & { projectName?: string })[];
}

export const RecentLedger: React.FC<Props> = ({ entries }) => {
  return (
    <Panel className="lg:col-span-8 col-span-12">
      <SectionHeader title="Recent Ledger" />
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-text-dim border-b border-border-main text-caption uppercase tracking-wider">
              <th scope="col" className="pb-3 font-medium">Status</th>
              <th scope="col" className="pb-3 font-medium">Project</th>
              <th scope="col" className="pb-3 font-medium">Event</th>
              <th scope="col" className="pb-3 font-medium text-right">Amount</th>
              <th scope="col" className="pb-3 font-medium text-right">Time</th>
            </tr>
          </thead>
          <tbody className="animate-in fade-in duration-normal">
            {entries.slice(0, 10).map((e) => (
              <tr key={e.id} className="border-b border-border-main/50 last:border-0">
                <td className="py-4 pr-4">
                  {e.metadata?.txHash ? (
                    <span className="flex items-center gap-2 text-success text-caption font-semibold"><CheckCircle size={16} /> On Chain</span>
                  ) : (
                    <span className="text-text-dim text-caption">Local</span>
                  )}
                </td>
                <td className="py-4 pr-4 text-text-main font-medium text-small">{e.projectName || 'System'}</td>
                <td className="py-4 pr-4 text-text-muted font-mono text-caption">{e.type.replace(/_/g, ' ')}</td>
                <td className="py-4 pr-4 text-text-main font-medium text-small text-right whitespace-nowrap">
                  {e.amount !== '0' ? money(e.amount) : '-'}
                </td>
                <td className="py-4 text-text-dim text-caption text-right whitespace-nowrap">
                  {new Date(e.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};

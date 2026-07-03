import { useEffect, useState } from 'react';
import { fetcher, money } from '../lib/api';
import { Project, LedgerEntry } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { CheckCircle, ExternalLink, Receipt } from 'lucide-react';

export const SettlementsPage = () => {
  const [settlements, setSettlements] = useState<(LedgerEntry & { projectName: string })[]>([]);

  useEffect(() => {
    const loadSettlements = async () => {
      const projects = await fetcher<Project[]>('/projects');
      const allEntries = await Promise.all(
        projects.map(async (p) => {
          const ledger = await fetcher<LedgerEntry[]>(`/projects/${p.id}/ledger`);
          return ledger.filter(e => e.type === 'SETTLEMENT' && e.metadata?.txHash).map(e => ({ ...e, projectName: p.name }));
        })
      );
      setSettlements(allEntries.flat().sort((a, b) => b.timestamp - a.timestamp));
    };
    loadSettlements();
  }, []);

  return (
    <div>
      <PageHeader title="Arc Settlements" icon={Receipt} />
      {settlements.length === 0 ? (
 <div className="bg-surface rounded-card border border-border-main p-12 text-center shadow-surface">
 <ExternalLink size={32} className="mx-auto text-text-dim mb-4" />
 <h3 className="text-h2 text-text-main">No On-Chain Settlements</h3>
 <p className="text-text-muted mt-2">Completed project milestones will appear here with Arc TX hashes.</p>
        </div>
      ) : (
 <div className="space-y-4">
          {settlements.map((s) => (
 <div key={s.id} className="bg-surface rounded-card border border-border-main p-6 shadow-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div className="flex items-center gap-4">
 <div className="p-3 bg-success/20 rounded-card text-success"><CheckCircle size={20} /></div>
                <div>
 <p className="font-semibold text-text-main">{s.projectName}</p>
 <p className="text-caption text-text-dim mt-1">Settled {new Date(s.timestamp).toLocaleString()}</p>
                </div>
              </div>
 <div className="sm:text-right text-left">
 <p className="text-title font-bold text-success tabular-nums">{money(s.amount)}</p>
 <a href={`https://arbiscan.io/tx/${s.metadata?.txHash}`} target="_blank" className="text-primary text-caption font-mono hover:underline flex items-center gap-1 justify-end mt-1">
                  {s.metadata?.txHash?.slice(0, 16)}... <ExternalLink size={16}/>
                </a>
 <p className="text-caption text-text-dim mt-1">Block #{s.metadata?.blockNumber?.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

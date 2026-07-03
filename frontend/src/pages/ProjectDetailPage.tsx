import React, { useEffect, useState } from 'react';
import { fetcher, poster } from '../lib/api';
import { Project, Milestone, Contractor, RiskScore, LedgerEntry } from '../types';
import { ProjectOverviewCards } from '../components/project/ProjectOverviewCards';
import { MilestoneTimeline } from '../components/project/MilestoneTimeline';
import { ContractorPanel } from '../components/project/ContractorPanel';
import { ProjectLedger } from '../components/project/ProjectLedger';
import { Drawer } from '../components/ui/Drawer';
import { Skeleton } from '../components/ui/Skeleton';
import { ArrowLeft, History } from 'lucide-react';

interface Props {
  id: string;
  onBack: () => void;
}

export const ProjectDetailPage: React.FC<Props> = ({ id, onBack }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [risk, setRisk] = useState<RiskScore | null>(null);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isSettling, setIsSettling] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [p, r, c, l] = await Promise.all([
        fetcher<Project>(`/projects/${id}`),
        fetcher<RiskScore>(`/projects/${id}/risk`).catch(() => null),
        fetcher<Contractor[]>('/contractors'),
        fetcher<LedgerEntry[]>(`/projects/${id}/ledger`)
      ]);
      setProject(p); setRisk(r); setContractors(c); setLedger(l);
    } catch (err) {
      setError("Unable to load project.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleFund = async (mId: string) => {
    setError('');
    const res = await poster<{ error?: string }>(`/projects/${id}/milestones/fund`, { milestoneId: mId });
    if (res.error) setError(res.error);
    else loadData();
  };

  const handleClaim = async (mId: string, cId: string) => {
    setError('');
    const res = await poster<{ error?: string }>(`/projects/${id}/milestones/claim`, { milestoneId: mId, contractorId: cId });
    if (res.error) setError(res.error);
    else loadData();
  };

  const handleSettle = async () => {
    setError('');
    setIsSettling(true);
    try {
      const res = await poster<{ error?: string }>(`/projects/${id}/complete`, {});
      if (res.error) setError(res.error);
      else await loadData();
    } catch {
      setError("Blockchain settlement failed.");
    } finally {
      setIsSettling(false);
    }
  };

 if (isLoading) return <div className="p-8 space-y-6"><Skeleton className="h-10 w-1/3" /><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i=><Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-64" /></div>;
 if (!project) return <div className="p-8 text-danger">{error || "Project not found"}</div>;

  return (
 <div>
 {error && <div className="bg-danger/10 border border-danger/50 text-danger px-4 py-3 rounded-card mb-6 text-small">{error}</div>}

      {/* Clean Header: Back -> Title -> Event History */}
 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
 <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
 className="p-3 rounded-btn bg-elevated border border-border-main hover:bg-white/5 text-text-muted hover:text-text-main transition-colors"
            aria-label="Go back to portfolio"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
 <h1 className="text-h1 font-bold text-text-main leading-tight">{project.name}</h1>
 <p className="text-small text-text-dim mt-1">Project Execution & Settlement</p>
          </div>
        </div>
        
 <button onClick={() => setIsHistoryOpen(true)} className="flex items-center gap-2 text-text-muted hover:text-text-main text-small transition-colors">
          <History size={20} /> Event History
        </button>
      </div>

      <ProjectOverviewCards project={project} risk={risk || undefined} />

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
 <div className="lg:col-span-2 bg-surface rounded-card border border-border-main p-6">
 <h3 className="text-h3 text-text-main mb-6">Milestone Execution Timeline</h3>
          <MilestoneTimeline 
            milestones={project.milestones} 
            contractors={contractors} 
            onFund={handleFund} 
            onClaim={handleClaim} 
            onSettle={handleSettle} 
            isSettling={isSettling}
            projectStatus={project.status}
          />
        </div>
        <ContractorPanel project={project} contractors={contractors} />
      </div>

      <ProjectLedger ledger={ledger} isLoading={false} />

      <Drawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title="Project Event History">
 <div className="space-y-4">
          {[...ledger].sort((a,b) => a.timestamp - b.timestamp).map(e => (
 <div key={e.id} className="border-l-2 border-border-main pl-4">
 <p className="text-small font-medium text-text-main">{e.type.replace(/_/g, ' ')}</p>
 <p className="text-caption text-text-dim mt-1">{new Date(e.timestamp).toLocaleString()}</p>
 {e.metadata?.txHash && <p className="text-caption text-primary font-mono mt-1 break-all">Tx: {e.metadata.txHash}</p>}
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
};

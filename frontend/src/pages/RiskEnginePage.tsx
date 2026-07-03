import { useEffect, useState } from 'react';
import { fetcher } from '../lib/api';
import { RiskScore } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { ShieldAlert } from 'lucide-react';

export const RiskEnginePage = () => {
  const [risks, setRisks] = useState<Record<string, RiskScore>>({});

  useEffect(() => {
    fetcher<Record<string, RiskScore>>('/system/risk').then(setRisks);
  }, []);

  const entries = Object.entries(risks);

  return (
    <div>
      <PageHeader title="Risk Engine" />
      {entries.length === 0 ? (
 <div className="bg-surface rounded-card border border-border-main p-12 text-center shadow-surface">
 <ShieldAlert size={32} className="mx-auto text-text-dim mb-4" />
 <h3 className="text-h3 font-semibold text-text-main">All Clear</h3>
 <p className="text-text-muted mt-2">No active projects require risk monitoring.</p>
        </div>
      ) : (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {entries.map(([id, r]) => (
 <div key={id} className="bg-surface rounded-card border border-border-main p-6 shadow-surface">
 <p className="text-caption text-text-dim mb-2 font-mono">PROJECT ID: {id.substring(0, 8)}...</p>
 <div className="space-y-4">
                <RiskRow label="Schedule" value={r.scheduleRisk} />
                <RiskRow label="Liquidity" value={r.liquidityRisk} />
                <RiskRow label="Funding" value={r.fundingRisk} />
                <RiskRow label="Contractor" value={r.contractorRisk} />
 <div className="pt-4 border-t border-border-main">
                  <RiskRow label="Composite" value={r.composite} large />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RiskRow = ({ label, value, large }: { label: string; value: number; large?: boolean }) => {
  const color = value > 70 ? 'bg-danger' : value > 40 ? 'bg-warning' : 'bg-success';
  return (
    <div>
 <div className="flex justify-between text-small mb-2">
 <span className="text-text-muted">{label}</span>
 <span className={`font-bold ${large ? 'text-h2 text-text-main' : 'text-text-main'}`}>{value}/100</span>
      </div>
 <div className="w-full bg-elevated rounded-full h-2">
 <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
};

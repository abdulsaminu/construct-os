import { useEffect, useState } from 'react';
import { fetcher } from '../lib/api';

const money = (val: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseInt(val));

export default function SystemPage() {
  const [risk, setRisk] = useState<Record<string, { composite: number }>>({});
  const [allocations, setAllocations] = useState<{ projectId: string; projectName: string; requestableCap: string; recommendation: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetcher<Record<string, { composite: number }>>('/system/risk').then(setRisk),
      fetcher<{ projectId: string; projectName: string; requestableCap: string; recommendation: string }[]>('/system/allocations').then(setAllocations)
    ]);
  }, []);

  return (
    <div>
      <h2 className="text-h2 font-bold mb-6">System Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-card border border-border-main shadow-surface">
          <h3 className="text-title font-semibold mb-4">Capital Allocation Rank</h3>
          {allocations.length === 0 ? (
            <p className="text-text-dim text-small">No active projects requiring allocation.</p>
          ) : (
            <div className="space-y-3">
              {allocations.map(a => (
                <div key={a.projectId} className="bg-elevated p-4 rounded-8 border border-border-main flex justify-between items-center">
                  <div>
                    <p className="text-small font-medium text-text-main">{a.projectName}</p>
                    <p className="text-caption text-text-dim mt-1">Max Cap: {money(a.requestableCap)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-badge text-caption font-bold ${a.recommendation === 'fund' ? 'bg-success/20 text-success' : a.recommendation === 'watch' ? 'bg-primary/20 text-primary' : 'bg-warning/20 text-warning'}`}>
                    {a.recommendation.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-surface p-6 rounded-card border border-border-main shadow-surface">
          <h3 className="text-title font-semibold mb-4">System Risk Map</h3>
          {Object.keys(risk).length === 0 ? (
            <p className="text-text-dim text-small">All projects completed.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(risk).map(([id, r]) => (
                <div key={id} className="bg-elevated p-4 rounded-8 border border-border-main">
                  <p className="text-small text-text-dim mb-2">Project ID: {id.substring(0, 8)}...</p>
                  <div className="w-full bg-border-main rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${r.composite > 70 ? 'bg-danger' : r.composite > 40 ? 'bg-warning' : 'bg-success'}`}
                      style={{ width: `${r.composite}%` }}
                    />
                  </div>
                  <p className="text-right text-small mt-1 font-bold text-text-main">Composite: {r.composite}/100</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
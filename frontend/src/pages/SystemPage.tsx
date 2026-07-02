import { useEffect, useState } from 'react';
import { fetcher } from '../api';

const money = (val: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseInt(val));

export default function SystemPage() {
  const [risk, setRisk] = useState<Record<string, any>>({});
  const [allocations, setAllocations] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([fetcher('/system/risk').then(setRisk), fetcher('/system/allocations').then(setAllocations)]);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">System Analytics</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800 p-4 rounded border border-slate-700">
          <h3 className="font-bold mb-4 text-lg">Capital Allocation Rank</h3>
          {allocations.length === 0 ? <p className="text-slate-500">No active projects requiring allocation.</p> : (
            <div className="space-y-3">{allocations.map(a => (
              <div key={a.projectId} className="bg-slate-900 p-3 rounded flex justify-between items-center">
                <div><p className="font-medium">{a.projectName}</p><p className="text-xs text-slate-400">Max Cap: {money(a.requestableCap)}</p></div>
                <span className={`px-3 py-1 rounded text-sm font-bold ${a.recommendation === 'fund' ? 'bg-green-900 text-green-300' : a.recommendation === 'watch' ? 'bg-blue-900 text-blue-300' : 'bg-yellow-900 text-yellow-300'}`}>{a.recommendation.toUpperCase()}</span>
              </div>
            ))}</div>
          )}
        </div>
        <div className="bg-slate-800 p-4 rounded border border-slate-700">
          <h3 className="font-bold mb-4 text-lg">System Risk Map</h3>
          {Object.keys(risk).length === 0 ? <p className="text-slate-500">All projects completed.</p> : (
            <div className="space-y-4">{Object.entries(risk).map(([id, r]: [string, any]) => (
              <div key={id} className="bg-slate-900 p-3 rounded">
                <p className="text-sm text-slate-400 mb-2">Project ID: {id.substring(0, 8)}...</p>
                <div className="w-full bg-slate-700 rounded-full h-3"><div className={`h-3 rounded-full ${r.composite > 70 ? 'bg-red-500' : r.composite > 40 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${r.composite}%` }}></div></div>
                <p className="text-right text-sm mt-1 font-bold">Composite: {r.composite}/100</p>
              </div>
            ))}</div>
          )}
        </div>
      </div>
    </div>
  );
}

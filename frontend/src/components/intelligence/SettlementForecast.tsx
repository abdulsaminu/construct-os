import React from 'react';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { money } from '../../lib/api';

interface SettlementData {
  totalSettled: string;
  byProject: Record<string, string>;
}

interface Props {
  forecast: SettlementData | null;
  isLoading: boolean;
  projectMap: Record<string, string>;
}

export const SettlementForecast: React.FC<Props> = ({ forecast, isLoading, projectMap }) => {
 if (isLoading || !forecast) return <Panel className="lg:col-span-4 col-span-12"><div className="space-y-4">{[1,2].map(i=><div key={i} className="bg-elevated rounded-card h-24 animate-pulse" />)}</div></Panel>;

  const projectEntries = Object.entries(forecast.byProject);

  return (
 <Panel className="lg:col-span-4 col-span-12">
      <SectionHeader title="Settlement Forecast" />
 <div className="bg-elevated rounded-card p-6 text-center mb-6">
 <p className="text-caption text-text-dim uppercase tracking-wide mb-2">Total Settled Capital</p>
 <p className="text-h1 font-bold text-success leading-none">{money(forecast.totalSettled)}</p>
      </div>
      
 <div className="space-y-3">
 <h4 className="text-small font-semibold text-text-main mb-2">By Project</h4>
        {projectEntries.length === 0 ? (
 <p className="text-small text-text-dim bg-surface p-3 rounded-8 text-center">No settlements yet.</p>
        ) : (
          projectEntries.map(([id, amount]) => (
 <div key={id} className="flex justify-between items-center p-3 bg-surface rounded-8">
 <span className="text-small text-text-muted">{projectMap[id] || id.substring(0,8)}</span>
 <span className="text-small font-semibold text-success">{money(amount)}</span>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
};

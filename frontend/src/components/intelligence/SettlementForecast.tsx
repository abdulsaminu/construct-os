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
  if (isLoading || !forecast) return <Panel className="col-span-4"><div className="space-y-4">{[1,2].map(i=><div key={i} className="bg-elevated rounded-xl h-24 animate-pulse" />)}</div></Panel>;

  const projectEntries = Object.entries(forecast.byProject);

  return (
    <Panel className="col-span-4">
      <SectionHeader title="Settlement Forecast" />
      <div className="bg-elevated rounded-2xl p-6 text-center mb-6">
        <p className="text-xs text-text-dim uppercase tracking-wide mb-2">Total Settled Capital</p>
        <p className="text-[36px] font-bold text-success leading-none">{money(forecast.totalSettled)}</p>
      </div>
      
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-text-main mb-2">By Project</h4>
        {projectEntries.length === 0 ? (
          <p className="text-sm text-text-dim bg-surface p-3 rounded-lg text-center">No settlements yet.</p>
        ) : (
          projectEntries.map(([id, amount]) => (
            <div key={id} className="flex justify-between items-center p-3 bg-surface rounded-lg">
              <span className="text-sm text-text-muted">{projectMap[id] || id.substring(0,8)}</span>
              <span className="text-sm font-semibold text-success">{money(amount)}</span>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
};

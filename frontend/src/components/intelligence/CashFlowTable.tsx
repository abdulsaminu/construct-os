import React from 'react';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { money } from '../../lib/api';

interface CashFlowData {
  days: number[];
  available: string[];
  locked: string[];
  settled: string[];
}

interface Props {
  forecast: CashFlowData | null;
  isLoading: boolean;
}

export const CashFlowTable: React.FC<Props> = ({ forecast, isLoading }) => {
 if (isLoading || !forecast) return <Panel className="lg:col-span-8 col-span-12"><div className="space-y-3">{[1,2,3,4,5].map(i=><div key={i} className="bg-elevated rounded-card h-12 animate-pulse" />)}</div></Panel>;

  return (
 <Panel className="lg:col-span-8 col-span-12">
      <SectionHeader title="Financial Forecasts" />
 <div className="overflow-x-auto">
 <caption className="sr-only">Cash flow summary</caption>
        <table className="w-full text-left">
          <thead>
 <tr className="border-b border-border-main text-text-dim text-label uppercase tracking-wider">
 <th scope="col" className="pb-3 font-medium pr-4">Day</th>
 <th scope="col" className="pb-3 font-medium px-4 text-right">Available</th>
 <th scope="col" className="pb-3 font-medium px-4 text-right">Locked</th>
 <th scope="col" className="pb-3 font-medium pl-4 text-right">Settled</th>
            </tr>
          </thead>
 <tbody className="divide-y divide-border-main/50">
            {forecast.days.map((day, i) => (
 <tr key={day} className="hover:bg-elevated/50 transition-colors">
 <td className="py-3 pr-4 text-body font-medium text-text-main">{day}</td>
 <td className="py-3 px-4 text-body font-semibold text-success text-right">{money(forecast.available[i])}</td>
 <td className="py-3 px-4 text-body font-semibold text-warning text-right">{money(forecast.locked[i])}</td>
 <td className="py-3 pl-4 text-body font-semibold text-primary text-right">{money(forecast.settled[i])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};

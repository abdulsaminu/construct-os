
import React from "react";
import { Panel } from "../../ui/Panel";
import { SectionHeader } from "../../ui/SectionHeader";
import { EmptyState } from "../../ui/EmptyState";
import { money } from "../../../lib/api";
import { CircularGauge } from "../../ui/CircularGauge";
import { TrendingUp } from "lucide-react";

interface ForecastData {
  cash: { days: number[]; available: string[]; locked: string[]; settled: string[] };
  settlement: { totalSettled: string; byProject: Record<string, string>; 
}

interface ForecastsPageProps {
  forecast: ForecastData | null;
  isLoading: boolean;
}

export const ForecastsPage: React.FC<ForecastsPageProps> = ({ forecast, isLoading }) => {
  if (isLoading) return <div className="grid grid-cols-2 gap-6">{[1,2,3,4].map(i => <div key={i} className="bg-surface rounded-2xl border border-border-main p-6 h-48 animate-pulse" />}</div>;
  if (!forecast) return <div className="bg-surface rounded-2xl border border-border-main p-12 text-center text-text-dim">Forecast unavailable.</div>;

  const getDayLabel = (index: number) => {
    if (index === 0) return "Today";
    return "Day " + forecast.cash.days[index];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[0, 6, 29, 89].map((targetDay: number) => {
          const i = forecast.cash.days.indexOf(targetDay);
          if (i === -1) return <div key={targetDay} className="bg-surface rounded-2xl border border-border-main p-6 h-24 animate-pulse" />;
          return (
            <div key={targetDay} className="bg-surface rounded-2xl border border-border-main p-6 text-center">
              <p className="text-text-dim text-xs uppercase tracking-wide mb-2">{getDayLabel(targetDay)}</p>
              <p className="text-xl font-bold text-success">{money(forecast.cash.available[i])}</p>
            </div>
          );
        })}
      </div>

      <Panel className="col-span-12">
        <SectionHeader title="Cash Flow Projection" />
        <div className="flex items-end gap-1 h-48 bg-elevated rounded-xl p-4 border-b border-border-main">
          {forecast.cash.available.map((val: string, i: number) => (
            <div key={i} className="flex-1 bg-primary/30 rounded-t-md border border-primary/20 transition-all hover:bg-primary/40 relative group" title={"Day " + forecast.cash.days[i] + ": " + val}>
              <div className="absolute inset-x-0 bottom-0 bg-primary/50 rounded-b-md" style={{ height: "100%" }}></div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-8 mt-4 text-xs text-text-dim">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary/50 rounded-sm" /> Available</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-warning/50 rounded-sm" /> Locked (Not Shown)</div>
        </div>
      </Panel>

      <div className="grid grid-cols-12 gap-6">
        <Panel className="col-span-8">
          <SectionHeader title="Milestone Completion Forecast" />
          <div className="bg-elevated rounded-xl p-6 text-center text-text-dim">
            <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
            <p>Future predictive scheduling requires AI engine integration.</p>
          </div>
        </Panel>

        <Panel className="col-span-4">
          <SectionHeader title="Settlement Forecast" />
          <div className="space-y-6">
            <div className="bg-elevated rounded-2xl p-6 text-center">
              <p className="text-text-dim text-xs uppercase tracking-wide mb-2">Expected Total</p>
              <p className="text-[28px] font-bold text-success leading-none">{money(forecast.settlement.totalSettled)}</p>
            </div>
            <div className="bg-elevated rounded-2xl p-6 text-center">
              <p className="text-text-dim text-xs uppercase tracking-wide mb-2">Forecast Confidence</p>
              <div className="flex justify-center"><CircularGauge value={82} size={80} /></div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-text-main">Upcoming Events</h4>
              <div className="p-3 bg-surface rounded-lg border-l-2 border-border-main text-sm text-text-muted">Settlement pipeline active.</div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};


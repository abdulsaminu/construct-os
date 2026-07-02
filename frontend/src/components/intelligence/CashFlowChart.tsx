import React from 'react';
import { money } from '../../lib/api';

interface CashFlowRow {
  day: number;
  available: string;
  locked: string;
  settled: string;
}

interface Props {
  data: CashFlowRow[];
  totalCapital: string;
}

export const CashFlowChart: React.FC<Props> = ({ data, totalCapital }) => {
  const cap = Number(totalCapital) || 1; // avoid division by zero

  return (
    <div
      className="flex items-end gap-[2px] h-56 bg-elevated rounded-12 p-4 border-b border-border-main overflow-x-auto"
      role="img"
      aria-label="Cash flow projection chart showing available, locked, and settled capital over 90 days"
    >
      {data.map((row, i) => {
        const availablePct = (Number(row.available) / cap) * 100;
        const lockedPct = (Number(row.locked) / cap) * 100;
        const settledPct = (Number(row.settled) / cap) * 100;

        return (
          <div
            key={i}
            className="flex-1 min-w-[14px] relative group"
            title={`Day ${row.day}: Available ${money(row.available)} / Locked ${money(row.locked)} / Settled ${money(row.settled)}`}
          >
            {/* Stacked bars — bottom to top: settled → locked → available */}
            <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end" style={{ height: '100%' }}>
              {/* Settled (bottom) */}
              <div
                className="bg-success/50 rounded-t-none transition-all hover:bg-success/70"
                style={{ height: `${Math.max(settledPct, 1)}%` }}
                aria-hidden="true"
              />
              {/* Locked (middle) */}
              <div
                className="bg-warning/50 transition-all hover:bg-warning/70"
                style={{ height: `${Math.max(lockedPct, 1)}%` }}
                aria-hidden="true"
              />
              {/* Available (top) */}
              <div
                className="bg-primary/50 rounded-t-sm transition-all hover:bg-primary/70"
                style={{ height: `${Math.max(availablePct, 1)}%` }}
                aria-hidden="true"
              />
            </div>

            {/* Day label on every ~15th point */}
            {data.length <= 14 || i % 4 === 0 ? (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-micro text-text-dim whitespace-nowrap">
                {row.day}d
              </div>
            ) : null}

            {/* Tooltip on hover — actual values from backend */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 pointer-events-none">
              <div className="bg-surface border border-border-main rounded-8 px-3 py-2 text-caption shadow-floating whitespace-nowrap">
                <p className="font-semibold text-text-main mb-1">Day {row.day}</p>
                <p className="text-primary">Available: {money(row.available)}</p>
                <p className="text-warning">Locked: {money(row.locked)}</p>
                <p className="text-success">Settled: {money(row.settled)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
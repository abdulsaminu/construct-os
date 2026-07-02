import React from 'react';
import { Economy } from '../../types';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';

interface Props {
  economy: Economy | null;
}

export const TreasuryFlow: React.FC<Props> = ({ economy }) => {
  return (
    <Panel className="col-span-4">
      <SectionHeader title="Treasury Flow" />
      <div className="space-y-6 mt-8">
        {/* Visual Stacked Bar (Equal placeholder widths per spec) */}
        <div className="flex h-4 rounded-full overflow-hidden bg-elevated">
          <div className="flex-1 bg-success" title="Available" />
          <div className="flex-1 bg-warning" title="Locked" />
          <div className="flex-1 bg-primary" title="Settled" />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-4">
          <LegendItem label="Available" color="bg-success" />
          <LegendItem label="Locked" color="bg-warning" />
          <LegendItem label="Settled" color="bg-primary" />
        </div>
      </div>
    </Panel>
  );
};

const LegendItem = ({ label, color }: { label: string; color: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-sm ${color}`} />
    <span className="text-sm text-text-muted">{label}</span>
  </div>
);

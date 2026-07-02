import React from 'react';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { HeartPulse } from 'lucide-react';

export const TreasuryHealth = () => (
  <Panel className="lg:col-span-4 col-span-12">
    <SectionHeader title="Treasury Health" />
    <div className="mt-6 flex flex-col items-center justify-center py-6 bg-elevated rounded-12 border border-border-main">
      <HeartPulse size={32} className="text-success mb-3" />
      <p className="text-h3 font-bold text-success mb-1">Healthy</p>
      <p className="text-caption text-text-dim text-center px-4">System operating within normal parameters</p>
    </div>
  </Panel>
);

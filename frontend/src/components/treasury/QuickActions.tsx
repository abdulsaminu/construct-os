import React from 'react';
import { Panel } from '../ui/Panel';
import { SectionHeader } from '../ui/SectionHeader';
import { Landmark, FolderKanban, ScrollText, TrendingUp, ChevronRight } from 'lucide-react';

interface Props {
  onNavigate: (id: string) => void;
}

export const QuickActions: React.FC<Props> = ({ onNavigate }) => {
  const actions = [
    { id: 'treasury-deposit', title: 'Deposit Capital', desc: 'Add funds to the pool', icon: Landmark, target: 'treasury' },
    { id: 'portfolio', title: 'Open Portfolio', desc: 'View active projects', icon: FolderKanban, target: 'portfolio' },
    { id: 'ledger', title: 'View Ledger', desc: 'Immutable financial log', icon: ScrollText, target: 'ledger' },
    { id: 'forecasts', title: 'Forecast Treasury', desc: 'Cash flow projections', icon: TrendingUp, target: 'forecasts' },
  ];

  return (
    <Panel className="col-span-4">
      <SectionHeader title="Quick Actions" />
      <div className="space-y-3 mt-6">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => onNavigate(action.target)}
            className="w-full flex items-center justify-between p-4 bg-elevated rounded-xl border border-border-main hover:-translate-y-0.5 hover:border-border-main transition-all duration-150 group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 text-text-muted group-hover:text-primary transition-colors">
                <action.icon size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-text-main">{action.title}</p>
                <p className="text-xs text-text-dim">{action.desc}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-text-dim group-hover:text-text-muted transition-colors" />
          </button>
        ))}
      </div>
    </Panel>
  );
};

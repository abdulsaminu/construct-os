import React from 'react';
import { Search, Download, List, AlignJustify } from 'lucide-react';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  eventFilter: string;
  onEventFilterChange: (v: string) => void;
  viewMode: 'table' | 'timeline';
  onViewModeChange: (v: 'table' | 'timeline') => void;
  onExport: () => void;
}

export const LedgerToolbar: React.FC<Props> = ({ search, onSearchChange, eventFilter, onEventFilterChange, viewMode, onViewModeChange, onExport }) => (
  <div className="flex flex-col md:flex-row gap-4 mb-6">
    <div className="relative flex-1">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
      <input
        type="text"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        placeholder="Search by TX hash, project..."
        className="w-full bg-elevated border border-border-main rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-main outline-none focus:border-primary"
      />
    </div>
    
    <div className="flex items-center gap-3">
      <select
        value={eventFilter}
        onChange={e => onEventFilterChange(e.target.value)}
        className="bg-elevated border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-main outline-none focus:border-primary appearance-none cursor-pointer"
      >
        <option value="all">All Events</option>
        <option value="CAPITAL_DEPOSIT">Deposits</option>
        <option value="MILESTONE_FUNDED">Funding</option>
        <option value="MILESTONE_CLAIMED">Claims</option>
        <option value="SETTLEMENT">Settlements</option>
      </select>

      <div className="flex bg-elevated border border-border-main rounded-xl p-1">
        <button onClick={() => onViewModeChange('table')} className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-surface text-primary' : 'text-text-dim hover:text-text-main'}`} aria-label="Table view"><AlignJustify size={18} /></button>
        <button onClick={() => onViewModeChange('timeline')} className={`p-2 rounded-lg transition-colors ${viewMode === 'timeline' ? 'bg-surface text-primary' : 'text-text-dim hover:text-text-main'}`} aria-label="Timeline view"><List size={18} /></button>
      </div>

      <button onClick={onExport} className="flex items-center gap-2 bg-elevated border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-muted hover:text-text-main transition-colors" aria-label="Export CSV">
        <Download size={16} /> Export
      </button>
    </div>
  </div>
);

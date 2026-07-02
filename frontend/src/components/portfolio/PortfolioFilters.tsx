import React from 'react';
import { Search } from 'lucide-react';

interface Props {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
}

export const PortfolioFilters: React.FC<Props> = ({ search, onSearchChange, statusFilter, onStatusChange }) => (
  <div className="flex flex-col sm:flex-row gap-4 mb-6">
    <div className="relative flex-1">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
      <input
        type="text"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        placeholder="Search projects..."
        className="w-full bg-elevated border border-border-main rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-main outline-none focus:border-primary transition-colors"
      />
    </div>
    <select
      value={statusFilter}
      onChange={e => onStatusChange(e.target.value)}
      className="bg-elevated border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-main outline-none focus:border-primary appearance-none cursor-pointer"
      aria-label="Filter by status"
    >
      <option value="all">All Status</option>
      <option value="draft">Draft</option>
      <option value="active">Active</option>
      <option value="completed">Completed</option>
      <option value="at_risk">At Risk</option>
    </select>
  </div>
);

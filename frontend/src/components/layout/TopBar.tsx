import React from 'react';
import { Search, Bell, Menu, User } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  onMenuClick: () => void;
}

export const TopBar: React.FC<Props> = ({ title, description, onMenuClick }) => {
  return (
    <header className="h-16 bg-surface border-b border-border-main flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-text-muted hover:text-text-main transition-all duration-fast ease-out active:scale-[0.98]"
          aria-label="Open menu"
        >
          <Menu size={24} strokeWidth={2} />
        </button>
        <div>
          <h2 className="text-h3 font-semibold text-text-main leading-tight">{title}</h2>
          <p className="text-caption text-text-dim">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="search-input hidden md:flex items-center bg-elevated rounded-input px-3 h-10 w-64 border border-border-main transition-colors">
          <Search size={24} strokeWidth={2} className="text-text-dim mr-2" />
          <input
            type="search"
            placeholder="Search..."
            aria-label="Search"
            className="bg-transparent w-full text-small text-text-main outline-none placeholder:text-text-dim"
          />
        </div>

        <button
          className="relative p-2 text-text-muted hover:text-text-main transition-all duration-fast ease-out active:scale-[0.98]"
          aria-label="Notifications"
        >
          <Bell size={24} strokeWidth={2} />
          <span className="absolute top-2 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        <button
          className="w-9 h-9 rounded-full bg-elevated border border-border-main flex items-center justify-center text-text-muted hover:text-text-main transition-all duration-fast ease-out active:scale-[0.98]"
          aria-label="User menu"
        >
          <User size={24} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
};
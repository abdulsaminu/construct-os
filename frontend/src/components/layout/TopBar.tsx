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
        <button onClick={onMenuClick} className="lg:hidden text-text-muted hover:text-text-main">
          <Menu size={24} />
        </button>
        <div>
          <h2 className="text-h3 font-semibold text-text-main leading-tight">{title}</h2>
          <p className="text-caption text-text-dim">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center bg-elevated rounded-lg px-3 h-10 w-64 border border-border-main focus-within:border-primary transition-colors">
          <Search size={16} className="text-text-dim mr-2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent w-full text-sm text-text-main outline-none placeholder:text-text-dim"
          />
        </div>
        
        <button className="relative p-2 text-text-muted hover:text-text-main transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        <button className="w-9 h-9 rounded-full bg-elevated border border-border-main flex items-center justify-center text-text-muted hover:text-text-main">
          <User size={18} />
        </button>
      </div>
    </header>
  );
};

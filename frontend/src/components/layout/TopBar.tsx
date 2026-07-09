import React, { useState } from 'react';
import { Search, Bell, Menu, User } from 'lucide-react';
import { ConnectWalletButton } from '../wallet/ConnectWalletButton';

interface Props {
  title: string;
  description: string;
  onMenuClick: () => void;
}

export const TopBar: React.FC<Props> = ({ title, description, onMenuClick }) => {
      const [searchTerm, setSearchTerm] = useState('');
      const handleSearch = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
          window.dispatchEvent(new CustomEvent('app-search', { detail: searchTerm.trim() }));
          setSearchTerm('');
        }
      };
  return (
    <header className="h-16 bg-surface border-b border-border-main flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-text-muted hover:text-text-main transition-all duration-fast ease-out"
          aria-label="Open menu"
        >
          <Menu aria-hidden='true' size={20} strokeWidth={2} />
        </button>
        <div>
          <h2 className="text-page-title font-bold text-text-main leading-tight">{title}</h2>
          <p className="text-small text-text-dim">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="search-input hidden md:flex items-center bg-elevated rounded-input px-3 h-10 w-64 border border-border-main transition-colors" onKeyDown={handleSearch}>
          <Search aria-hidden='true' size={18} strokeWidth={2} className="text-text-dim mr-2" />
          <input
            type="search"
            placeholder="Search..."
            aria-label="Search"
            className="bg-transparent w-full text-small text-text-main outline-none placeholder:text-text-dim"
          />
        </div>

        <ConnectWalletButton />

        <button
          className="relative p-2 text-text-muted hover:text-text-main transition-all duration-fast ease-out"
          aria-label="Notifications"
        >
          <Bell aria-hidden='true' size={20} strokeWidth={2} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span><span className="sr-only">1 unread</span>
        </button>

        <button
          className="w-9 h-9 rounded-full bg-elevated border border-border-main flex items-center justify-center text-text-muted hover:text-text-main transition-all duration-fast ease-out"
          aria-label="User menu"
        >
          <User aria-hidden='true' size={18} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
};

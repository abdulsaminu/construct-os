import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<Props> = ({ children, className = '' }) => (
  <div className={`bg-surface rounded-card border border-border-main p-6 shadow-surface card-interactive ${className}`}>
    {children}
  </div>
);
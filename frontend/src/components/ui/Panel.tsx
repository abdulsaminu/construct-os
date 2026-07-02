import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<Props> = ({ children, className = '' }) => (
  <div className={`bg-surface rounded-2xl border border-border-main p-6 shadow-soft ${className}`}>
    {children}
  </div>
);

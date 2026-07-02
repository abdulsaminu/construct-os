import React from 'react';

interface Props {
  title: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<Props> = ({ title, action }) => (
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-h2 font-bold text-text-main">{title}</h1>
    {action && <div>{action}</div>}
  </div>
);

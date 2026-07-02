import React from 'react';

interface Props {
  title: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<Props> = React.memo(({ title, action }) => (
  <div className="flex items-center justify-between mb-6">
    <h3 className="text-h3 font-semibold text-text-main leading-tight">{title}</h3>
    {action}
  </div>
));

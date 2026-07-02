import React from 'react';

interface Props {
  text: string;
  color?: string;
}

export const Badge: React.FC<Props> = ({ text, color = 'bg-white/10 text-text-dim' }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${color}`}>
    {text}
  </span>
);

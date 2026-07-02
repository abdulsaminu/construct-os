import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  id: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const Accordion: React.FC<Props> = ({ id, trigger, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border-main rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left bg-elevated hover:bg-white/5 transition-colors"
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${id}`}
      >
        {trigger}
        <ChevronDown size={18} className={`text-text-dim transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        id={`accordion-content-${id}`}
        role="region"
        aria-labelledby={id}
        className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-4 border-t border-border-main bg-surface">
          {children}
        </div>
      </div>
    </div>
  );
};

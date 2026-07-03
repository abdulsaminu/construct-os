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
 <div className="border border-border-main rounded-dialog overflow-hidden">
      <button
        id={id}
        onClick={() => setIsOpen(!isOpen)}
 className="w-full flex items-center justify-between p-4 text-left bg-elevated hover:bg-border-main rounded-btn transition-colors"
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${id}`}
      >
        {trigger}
        <ChevronDown
          size={20}
          strokeWidth={2}
 className={`text-text-dim transition-transform duration-normal ease-out ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        id={`accordion-content-${id}`}
        role="region"
        aria-labelledby={id}
 className={`accordion-content ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
 <div className="p-4 border-t border-border-main bg-surface">
          {children}
        </div>
      </div>
    </div>
  );
};
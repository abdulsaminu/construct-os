import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  subLabel?: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const Select: React.FC<Props> = ({ options, value, onChange, placeholder = 'Select...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative w-full">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-elevated border border-border-main rounded-xl p-3 text-left text-sm text-text-main focus:outline-none focus:border-primary transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div>
          <p className={selected ? 'font-medium' : 'text-text-dim'}>{selected ? selected.label : placeholder}</p>
          {selected?.subLabel && <p className="text-xs text-text-dim mt-0.5">{selected.subLabel}</p>}
        </div>
        <ChevronDown size={16} className={`text-text-dim transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-surface border border-border-main rounded-xl shadow-lg py-1 max-h-60 overflow-y-auto">
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => { onChange(option.value); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-elevated transition-colors flex flex-col ${value === option.value ? 'bg-primary/10 text-primary' : 'text-text-main'}`}
              role="option"
              aria-selected={value === option.value}
            >
              <span className="font-medium">{option.label}</span>
              {option.subLabel && <span className="text-xs text-text-dim mt-0.5">{option.subLabel}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

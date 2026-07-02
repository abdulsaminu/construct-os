import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selected = options.find(o => o.value === value);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        const idx = options.findIndex(o => o.value === value);
        setFocusedIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % options.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + options.length) % options.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          onChange(options[focusedIndex].value);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  }, [isOpen, focusedIndex, options, onChange, value]);

  // Auto-focus selected or first option on open
  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex(o => o.value === value);
      const targetIndex = idx >= 0 ? idx : 0;
      setFocusedIndex(targetIndex);
      // Focus the option element after render
      requestAnimationFrame(() => {
        optionRefs.current[targetIndex]?.focus();
      });
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync focused option scroll into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      optionRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  const close = () => setIsOpen(false);

  return (
    <div ref={ref} className="relative w-full" onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-elevated border border-border-main rounded-btn p-3 text-left text-sm text-text-main focus:outline-none focus:border-primary transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div>
          <p className={selected ? 'font-medium' : 'text-text-dim'}>{selected ? selected.label : placeholder}</p>
          {selected?.subLabel && <p className="text-xs text-text-dim mt-0.5">{selected.subLabel}</p>}
        </div>
        <ChevronDown
          size={24}
          strokeWidth={2}
          className={`text-text-dim transition-transform duration-normal ease-out ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="dropdown-panel absolute z-20 mt-1 w-full bg-surface border border-border-main rounded-btn shadow-level-3 py-1 max-h-60 overflow-y-auto"
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={el => { optionRefs.current[index] = el; }}
              type="button"
              onClick={() => { onChange(option.value); close(); }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-elevated transition-colors flex flex-col ${value === option.value ? 'bg-primary/10 text-primary' : 'text-text-main'}`}
              role="option"
              aria-selected={value === option.value}
              tabIndex={focusedIndex === index ? 0 : -1}
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
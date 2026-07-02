import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<Props> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface border-l border-border-main h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="sticky top-0 bg-surface z-10 p-6 border-b border-border-main flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-main">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-elevated text-text-muted transition-colors" aria-label="Close drawer">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

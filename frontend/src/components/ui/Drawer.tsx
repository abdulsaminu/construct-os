import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const Drawer: React.FC<Props> = ({ isOpen, onClose, title, children }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Focus trap + focus management
  useEffect(() => {
    if (isOpen) {
      // Save the currently focused element to restore later
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus first focusable element
      requestAnimationFrame(() => {
        if (panelRef.current) {
          const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
          if (focusable.length > 0) focusable[0].focus();
        }
      });

      const handleTabTrap = (e: KeyboardEvent) => {
        if (e.key !== 'Tab' || !panelRef.current) return;
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTabTrap);
      return () => document.removeEventListener('keydown', handleTabTrap);
    } else {
      // Restore focus to trigger element on close
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
  }, [isOpen]);

  // ESC to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="dialog-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="drawer-panel relative w-full max-w-md bg-surface border-l border-border-main h-full overflow-y-auto shadow-floating rounded-dialog"
      >
        <div className="sticky top-0 bg-surface z-10 p-6 border-b border-border-main flex items-center justify-between">
          <h2 className="text-title font-semibold text-text-main">{title}</h2>
          <button
            onClick={onClose}
            className="p-3 rounded-btn hover:bg-elevated text-text-muted transition-colors"
            aria-label="Close drawer"
          >
            <X size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
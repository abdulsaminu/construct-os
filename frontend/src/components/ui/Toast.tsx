import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ToastType = 'success' | 'warning' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (opts: { type: ToastType; title: string; description?: string }) => void;
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>');
  return ctx;
};

/* ------------------------------------------------------------------ */
/*  Style maps                                                         */
/* ------------------------------------------------------------------ */

const typeStyles: Record<ToastType, string> = {
  success: 'bg-success/10 border-success/30 text-success',
  warning: 'bg-warning/10 border-warning/30 text-warning',
  error:   'bg-danger/10  border-danger/30  text-danger',
  info:    'bg-primary/10 border-primary/30 text-primary',
};

const typeIcons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  warning: AlertTriangle,
  error:   XCircle,
  info:    Info,
};

/* ------------------------------------------------------------------ */
/*  Single toast item                                                  */
/* ------------------------------------------------------------------ */

const AUTO_DISMISS_MS = 4000;
const EXIT_ANIM_MS = 200;

const ToastItemComponent: React.FC<{
  item: ToastItem;
  onDismiss: (id: string) => void;
}> = ({ item, onDismiss }) => {
  const [exiting, setExiting] = React.useState(false);
  const Icon = typeIcons[item.type];

  React.useEffect(() => {
    const timer = setTimeout(() => setExiting(true), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [item.id]);

  const handleDismiss = useCallback(() => setExiting(true), []);

  React.useEffect(() => {
    if (!exiting) return;
    const timer = setTimeout(() => onDismiss(item.id), EXIT_ANIM_MS);
    return () => clearTimeout(timer);
  }, [exiting, item.id, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
 className={`toast-enter ${exiting ? 'toast-exit' : ''} bg-surface rounded-card border shadow-raised flex items-start gap-3 w-80 p-4 ${typeStyles[item.type]}`}
    >
 <Icon aria-hidden='true' size={20} className="shrink-0 mt-1" />
 <div className="flex-1 min-w-0">
 <p className="text-small font-semibold text-text-main">{item.title}</p>
        {item.description && (
 <p className="text-caption text-text-muted mt-1 leading-relaxed">{item.description}</p>
        )}
      </div>
      <button
        onClick={handleDismiss}
 className="shrink-0 p-1 rounded-8 hover:bg-elevated text-text-dim hover:text-text-main transition-colors duration-fast"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (opts: { type: ToastType; title: string; description?: string }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, ...opts }]);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container – fixed top-right, stacked */}
 <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
 <div key={t.id} className="pointer-events-auto">
            <ToastItemComponent item={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
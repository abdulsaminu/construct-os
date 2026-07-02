import React, { useCallback, useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Props {
  children: React.ReactNode;
  content: string;
  delay?: number;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

/* ------------------------------------------------------------------ */
/*  Positioning classes                                                */
/* ------------------------------------------------------------------ */

const sideClasses: Record<NonNullable<Props['side']>, string> = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full  left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full  top-1/2 -translate-y-1/2 ml-2',
};

const DEFAULT_DELAY = 300;
const HIDE_DELAY = 150;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const Tooltip: React.FC<Props> = ({
  children,
  content,
  delay = DEFAULT_DELAY,
  side = 'top',
}) => {
  const [visible, setVisible] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (showTimer.current) { clearTimeout(showTimer.current); showTimer.current = null; }
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const handleMouseEnter = useCallback(() => {
    clearTimers();
    showTimer.current = setTimeout(() => setVisible(true), delay);
  }, [delay, clearTimers]);

  const handleMouseLeave = useCallback(() => {
    clearTimers();
    hideTimer.current = setTimeout(() => setVisible(false), HIDE_DELAY);
  }, [clearTimers]);

  if (!content) return <>{children}</>;

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {visible && (
        <div
          role="tooltip"
          className={`absolute ${sideClasses[side]} z-50 max-w-[200px] text-small text-text-main px-3 py-2 bg-elevated border border-border-main rounded-btn shadow-raised whitespace-normal`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
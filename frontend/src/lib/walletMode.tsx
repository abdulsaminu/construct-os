import React, { createContext, useContext, useState } from 'react';

export type WalletMode = 'user' | 'demo';

const STORAGE_KEY = 'constructos-wallet-mode';

interface WalletModeContextValue {
  mode: WalletMode;
  setMode: (mode: WalletMode) => void;
}

const WalletModeContext = createContext<WalletModeContextValue | undefined>(undefined);

function readStoredMode(): WalletMode {
  if (typeof window === 'undefined') return 'demo';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'user' ? 'user' : 'demo';
}

export const WalletModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<WalletMode>(readStoredMode);

  const setMode = (next: WalletMode) => {
    setModeState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  };

  return (
    <WalletModeContext.Provider value={{ mode, setMode }}>
      {children}
    </WalletModeContext.Provider>
  );
};

export function useWalletMode(): WalletModeContextValue {
  const ctx = useContext(WalletModeContext);
  if (!ctx) throw new Error('useWalletMode must be used within a WalletModeProvider');
  return ctx;
}

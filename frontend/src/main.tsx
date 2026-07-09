import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import { wagmiConfig } from './lib/web3'
import { WalletModeProvider } from './lib/walletMode'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletModeProvider>
          <App />
        </WalletModeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)

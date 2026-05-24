'use client';

import React, { useEffect } from 'react';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useStore } from '@/store/useStore';
import '@mysten/dapp-kit/dist/index.css';

const queryClient = new QueryClient();

// Configure networks using standard mainnet/testnet HTTP endpoints
const { networkConfig } = createNetworkConfig({
  mainnet: { url: 'https://fullnode.mainnet.sui.io:443' },
  testnet: { url: 'https://fullnode.testnet.sui.io:443' },
});

// A helper component to synchronize the real connected wallet address back into Zustand global state.
function WalletStateSync() {
  const account = useCurrentAccount();
  const connectWallet = useStore((state) => state.connectWallet);
  const disconnectWallet = useStore((state) => state.disconnectWallet);

  useEffect(() => {
    if (account?.address) {
      connectWallet(account.address);
    } else {
      disconnectWallet();
    }
  }, [account, connectWallet, disconnectWallet]);

  return null;
}

export default function SuiProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider autoConnect>
          <WalletStateSync />
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

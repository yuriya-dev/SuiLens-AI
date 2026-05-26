'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Search, Wallet, LogOut, Radio, Cpu, Database } from 'lucide-react';
import { ConnectModal, useCurrentAccount, useDisconnectWallet, useSignPersonalMessage } from '@mysten/dapp-kit';

export default function Navbar() {
  const router = useRouter();
  const { 
    connectedWallet, 
    analyzeWallet, 
    isAnalyzing,
    isWalletVerified,
    isVerifyingWallet,
    verifyWallet,
    connectWallet,
    disconnectWallet
  } = useStore();

  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

  React.useEffect(() => {
    if (account?.address) {
      connectWallet(account.address);
    } else {
      disconnectWallet();
    }
  }, [account, connectWallet, disconnectWallet]);

  const [inputVal, setInputVal] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    
    router.push(`/wallet/${encodeURIComponent(inputVal.trim())}`);
    setInputVal('');
  };

  const handleVerify = async () => {
    if (!account) return;
    try {
      await verifyWallet(account.address, signPersonalMessage);
    } catch (err: any) {
      alert(`Wallet cryptographic verification failed: ${err.message || err}`);
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="glass-panel border-b border-[rgba(0,209,255,0.08)] bg-[rgba(5,8,22,0.4)] backdrop-blur-md h-20 px-8 flex items-center justify-between sticky top-0 z-30 w-full">
      {/* Left Section - Quick Search */}
      <form onSubmit={handleSearch} className="w-1/3 relative group">
        <input 
          type="text" 
          placeholder="Paste Sui Wallet address or enter ens name..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={isAnalyzing}
          className={`w-full bg-[#0b1220]/60 border border-white/10 group-hover:border-cyan-glow/50 focus:border-cyan-glow text-white/90 text-sm pl-11 py-2.5 rounded-xl outline-none transition-all duration-300 font-sans tracking-wide shadow-[0_4px_12px_rgba(0,0,0,0.2)] focus:shadow-[0_0_15px_rgba(0,209,255,0.15)] disabled:opacity-50 ${
            isAnalyzing ? 'pr-32' : 'pr-4'
          }`}
        />
        <Search className="w-4 h-4 text-white/40 group-focus-within:text-cyan-glow absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
        
        {isAnalyzing && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] text-cyan-glow bg-[#050816] border border-cyan-glow/30 px-2.5 py-1 rounded-lg font-display font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-ping"></span>
            <span>SCANNING...</span>
          </div>
        )}
      </form>

      {/* Right Section - Status Metrics & Wallet */}
      <div className="flex items-center gap-6">
        {/* Status Indicators */}
        <div className="hidden lg:flex items-center gap-5 border-r border-white/5 pr-6 text-[11px] font-display font-semibold tracking-wider text-white/50">
          {/* AI Copilot Status */}
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-glow animate-pulse" />
            <span>AI: <span className="text-cyan-glow">ONLINE</span></span>
          </div>

          {/* Walrus Storage Status */}
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-purple-glow animate-pulse" />
            <span>WALRUS: <span className="text-purple-glow">SECURE</span></span>
          </div>

          {/* Network Status */}
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-success-green animate-pulse" />
            <span>SUI MAINNET: <span className="text-success-green">ACTIVE</span></span>
          </div>
        </div>

        {/* Connect Wallet Button */}
        {account ? (
          <div className="flex items-center gap-3">
            {/* Cryptographic Verification Badge */}
            {isWalletVerified ? (
              <div className="flex items-center gap-1.5 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] text-[#10b981] px-3 py-1.5 rounded-lg text-[10px] font-display font-bold tracking-wider uppercase shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
                🛡️ Verified
              </div>
            ) : (
              <button
                onClick={handleVerify}
                disabled={isVerifyingWallet}
                className="flex items-center gap-1.5 bg-[rgba(245,158,11,0.15)] hover:bg-[rgba(245,158,11,0.25)] border border-[rgba(245,158,11,0.4)] hover:border-[rgba(245,158,11,0.8)] text-[#f59e0b] px-3 py-1.5 rounded-lg text-[10px] font-display font-bold tracking-wider uppercase transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-ping"></span>
                {isVerifyingWallet ? 'Verifying...' : '⚠️ Verify Wallet'}
              </button>
            )}

            {/* Address Badge / Disconnect Button */}
            <button
              onClick={() => disconnect()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-md cursor-pointer bg-[rgba(139,92,246,0.15)] hover:bg-[rgba(139,92,246,0.25)] border border-purple-glow/50 hover:border-purple-glow text-purple-glow"
            >
              <Wallet className="w-4 h-4" />
              <span>
                {truncateAddress(account.address)}
              </span>
              <LogOut className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 ml-1 hover:text-rose-500 transition-colors" />
            </button>
          </div>
        ) : (
          <ConnectModal
            trigger={
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-md cursor-pointer bg-gradient-to-r from-cyan-glow to-sui-blue hover:from-sui-blue hover:to-cyan-glow text-[#050816] shadow-[0_0_15px_rgba(0,209,255,0.25)] hover:shadow-[0_0_20px_rgba(0,209,255,0.4)]"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            }
          />
        )}
      </div>
    </header>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Search, Wallet, LogOut, Radio, Cpu, Database, Menu } from 'lucide-react';
import { ConnectModal, useCurrentAccount, useDisconnectWallet, useSignPersonalMessage } from '@mysten/dapp-kit';
import BrandLogo from '@/components/BrandLogo';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

export default function Navbar() {
  const router = useRouter();
  const { 
    isAnalyzing,
    isWalletVerified,
    isVerifyingWallet,
    verifyWallet,
    connectWallet,
    disconnectWallet,
    mobileSidebarOpen,
    setMobileSidebarOpen
  } = useStore();

  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

  const [telemetry, setTelemetry] = useState({
    ai: 'LOADING',
    walrus: 'LOADING',
    sui: 'LOADING'
  });

  React.useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/telemetry`);
        if (res.ok) {
          const data = await res.json();
          setTelemetry({
            ai: data.ai || 'FALLBACK',
            walrus: data.walrus || 'OFFLINE',
            sui: data.sui || 'OFFLINE'
          });
        } else {
          setTelemetry({
            ai: 'FALLBACK',
            walrus: 'OFFLINE',
            sui: 'OFFLINE'
          });
        }
      } catch (err) {
        console.error('Failed to fetch live service telemetry:', err);
        setTelemetry({
          ai: 'FALLBACK',
          walrus: 'OFFLINE',
          sui: 'OFFLINE'
        });
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (account?.address) {
      connectWallet(account.address);
    } else {
      disconnectWallet();
    }
  }, [account, connectWallet, disconnectWallet]);

  // Helper to resolve styling for AI telemetry state
  const getAiStyle = () => {
    switch (telemetry.ai) {
      case 'ONLINE':
        return { color: 'text-cyan-glow', label: 'ONLINE', iconClass: 'text-cyan-glow animate-pulse' };
      case 'FALLBACK':
        return { color: 'text-warning-orange', label: 'FALLBACK', iconClass: 'text-warning-orange animate-pulse' };
      case 'OFFLINE':
        return { color: 'text-danger-red', label: 'OFFLINE', iconClass: 'text-danger-red animate-pulse' };
      case 'LOADING':
      default:
        return { color: 'text-white/40', label: 'LOADING...', iconClass: 'text-white/30 animate-pulse' };
    }
  };

  // Helper to resolve styling for Walrus telemetry state
  const getWalrusStyle = () => {
    switch (telemetry.walrus) {
      case 'SECURE':
        return { color: 'text-purple-glow', label: 'SECURE', iconClass: 'text-purple-glow animate-pulse' };
      case 'OFFLINE':
        return { color: 'text-danger-red', label: 'OFFLINE', iconClass: 'text-danger-red animate-pulse' };
      case 'LOADING':
      default:
        return { color: 'text-white/40', label: 'LOADING...', iconClass: 'text-white/30 animate-pulse' };
    }
  };

  // Helper to resolve styling for Sui telemetry state
  const getSuiStyle = () => {
    switch (telemetry.sui) {
      case 'ACTIVE':
        return { color: 'text-success-green', label: 'ACTIVE', iconClass: 'text-success-green animate-pulse' };
      case 'DEGRADED':
        return { color: 'text-warning-orange', label: 'DEGRADED', iconClass: 'text-warning-orange animate-pulse' };
      case 'OFFLINE':
        return { color: 'text-danger-red', label: 'OFFLINE', iconClass: 'text-danger-red animate-pulse' };
      case 'LOADING':
      default:
        return { color: 'text-white/40', label: 'LOADING...', iconClass: 'text-white/30 animate-pulse' };
    }
  };

  const aiStyle = getAiStyle();
  const walrusStyle = getWalrusStyle();
  const suiStyle = getSuiStyle();

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
    } catch (err: unknown) {
      alert(`Wallet cryptographic verification failed: ${getErrorMessage(err)}`);
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="glass-panel border-b border-[rgba(0,209,255,0.08)] bg-[rgba(5,8,22,0.4)] backdrop-blur-md h-20 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 w-full gap-4">
      {/* Mobile Menu Toggle Burger Button */}
      <button
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        className="flex md:hidden items-center justify-center w-10 h-10 rounded-xl border border-white/10 hover:border-cyan-glow/50 text-white/70 hover:text-cyan-glow bg-[#0b1220]/60 transition-all cursor-pointer shrink-0"
        title="Toggle Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <BrandLogo className="hidden lg:flex flex-shrink-0" />

      {/* Left Section - Quick Search (Hidden on Mobile for screen space) */}
      <form onSubmit={handleSearch} className="hidden sm:block flex-1 md:flex-none md:w-1/3 max-w-sm relative group">
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
            <Cpu className={`w-3.5 h-3.5 ${aiStyle.iconClass}`} />
            <span>AI: <span className={aiStyle.color}>{aiStyle.label}</span></span>
          </div>

          {/* Walrus Storage Status */}
          <div className="flex items-center gap-2">
            <Database className={`w-3.5 h-3.5 ${walrusStyle.iconClass}`} />
            <span>WALRUS: <span className={walrusStyle.color}>{walrusStyle.label}</span></span>
          </div>

          {/* Network Status */}
          <div className="flex items-center gap-2">
            <Radio className={`w-3.5 h-3.5 ${suiStyle.iconClass}`} />
            <span>SUI MAINNET: <span className={suiStyle.color}>{suiStyle.label}</span></span>
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

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Search, Wallet, LogOut, Radio, Cpu, Database } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { 
    connectedWallet, 
    connectWallet, 
    disconnectWallet, 
    analyzeWallet, 
    isAnalyzing 
  } = useStore();

  const [inputVal, setInputVal] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    
    try {
      const data = await analyzeWallet(inputVal);
      router.push(`/wallet/${data.address}`);
      setInputVal('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnectSimulated = () => {
    if (connectedWallet) {
      disconnectWallet();
    } else {
      // Connect default smart money address
      connectWallet('0x7a8109d9f10be280b2a7582eb7bc3696f018888a');
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
          className="w-full bg-[#0b1220]/60 border border-white/10 group-hover:border-cyan-glow/50 focus:border-cyan-glow text-white/90 text-sm pl-11 pr-4 py-2.5 rounded-xl outline-none transition-all duration-300 font-sans tracking-wide shadow-[0_4px_12px_rgba(0,0,0,0.2)] focus:shadow-[0_0_15px_rgba(0,209,255,0.15)] disabled:opacity-50"
        />
        <Search className="w-4 h-4 text-white/40 group-focus-within:text-cyan-glow absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
        
        {isAnalyzing && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-cyan-glow">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-ping"></span>
            <span className="font-display font-medium tracking-wide">SCANNING...</span>
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
        <button
          onClick={handleConnectSimulated}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-md cursor-pointer
            ${connectedWallet 
              ? 'bg-[rgba(139,92,246,0.15)] hover:bg-[rgba(139,92,246,0.25)] border border-purple-glow/50 hover:border-purple-glow text-purple-glow' 
              : 'bg-gradient-to-r from-cyan-glow to-sui-blue hover:from-sui-blue hover:to-cyan-glow text-[#050816] shadow-[0_0_15px_rgba(0,209,255,0.25)] hover:shadow-[0_0_20px_rgba(0,209,255,0.4)]'
            }
          `}
        >
          <Wallet className="w-4 h-4" />
          <span>
            {connectedWallet ? truncateAddress(connectedWallet) : 'Connect Wallet'}
          </span>
          {connectedWallet && (
            <LogOut className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 ml-1 hover:text-rose-500 transition-colors" />
          )}
        </button>
      </div>
    </header>
  );
}

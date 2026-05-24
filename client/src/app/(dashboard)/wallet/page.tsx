'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Wallet, Search, Brain, HelpCircle, HelpCircle as HelpIcon } from 'lucide-react';

export default function WalletSearchFallback() {
  const router = useRouter();
  const { analyzeWallet, isAnalyzing } = useStore();
  const [inputVal, setInputVal] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    try {
      const data = await analyzeWallet(inputVal);
      router.push(`/wallet/${data.address}`);
    } catch (err) {
      console.error(err);
    }
  };

  const sampleWallets = [
    { name: 'suilens.sui (Smart Money)', address: '0x7a8109d9f10be280b2a7582eb7bc3696f018888a' },
    { name: 'degentrader.sui (Meme Degen)', address: '0xde202f5a6b0c2eef9ba7582eb7bc3696f018889a' },
    { name: 'yieldfarmer.sui (Defi Farmer)', address: '0x3c2fa56b0c2eef9ba7582eb7bc3696f018882fd' }
  ];

  return (
    <div className="max-w-2xl mx-auto py-16 text-center space-y-8 relative">
      <div className="absolute inset-0 terminal-grid opacity-5 pointer-events-none" />
      
      {/* Visual icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full border border-cyan-glow/20 bg-cyan-glow/5 flex items-center justify-center mx-auto animate-pulse">
          <Wallet className="w-10 h-10 text-cyan-glow" />
        </div>
        <div className="absolute inset-0 rounded-full border border-cyan-glow/20 animate-ping opacity-20 w-20 h-20 mx-auto" />
      </div>

      <div className="space-y-2">
        <h1 className="font-display font-extrabold text-3xl text-white tracking-wide">
          AI Wallet Analyzer
        </h1>
        <p className="font-sans text-xs text-white/40 uppercase tracking-widest leading-relaxed max-w-md mx-auto">
          Scan any Sui Wallet to analyze asset concentrations, profile behaviors, and verify rug pull risks
        </p>
      </div>

      {/* Dynamic Search Box */}
      <form onSubmit={handleSearch} className="relative group max-w-lg mx-auto">
        <input 
          type="text" 
          placeholder="Paste Sui Wallet address or enter ens name..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={isAnalyzing}
          className="w-full bg-[#0b1220]/60 border border-white/10 group-hover:border-cyan-glow/50 focus:border-cyan-glow text-white text-xs pl-12 pr-28 py-4.5 rounded-xl outline-none transition-all shadow-[0_4px_12px_rgba(0,0,0,0.3)] focus:shadow-[0_0_20px_rgba(0,209,255,0.15)] disabled:opacity-50"
        />
        <Search className="w-4 h-4 text-white/40 group-focus-within:text-cyan-glow absolute left-4.5 top-1/2 -translate-y-1/2 transition-colors" />
        
        <button
          type="submit"
          disabled={!inputVal.trim() || isAnalyzing}
          className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-cyan-glow hover:bg-sui-blue text-[#050816] text-xs font-display font-bold uppercase tracking-wider transition-all disabled:opacity-30 cursor-pointer"
        >
          {isAnalyzing ? 'Scanning...' : 'Analyze'}
        </button>
      </form>

      {/* Sample presets triggers */}
      <div className="space-y-3 pt-6 max-w-md mx-auto">
        <span className="text-[10px] font-display font-semibold tracking-wider text-white/30 uppercase block text-left">
          Or load a sample simulation wallet:
        </span>
        <div className="flex flex-col gap-2">
          {sampleWallets.map((wallet) => (
            <button
              key={wallet.address}
              onClick={() => {
                setInputVal(wallet.address);
                router.push(`/wallet/${wallet.address}`);
              }}
              disabled={isAnalyzing}
              className="text-left text-xs px-4 py-3 rounded-xl border border-white/5 bg-white/2 hover:bg-cyan-glow/5 hover:border-cyan-glow/20 text-white/60 hover:text-white transition-all cursor-pointer font-mono flex items-center justify-between"
            >
              <span>{wallet.name}</span>
              <span className="text-[10px] text-white/30 select-all">{wallet.address.slice(0, 12)}...</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

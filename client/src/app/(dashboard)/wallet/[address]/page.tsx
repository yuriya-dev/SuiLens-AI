'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import RiskScoreRing from '@/components/RiskScoreRing';
import LoadingScanner from '@/components/LoadingScanner';
import WalrusStorageBadge from '@/components/WalrusStorageBadge';
import { 
  Shield, 
  TrendingUp, 
  Clock, 
  Activity, 
  Coins, 
  CornerDownRight, 
  ChevronRight,
  Flame,
  Brain,
  Smile,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Cell, PieChart, Pie, ResponsiveContainer, Tooltip } from 'recharts';

export default function WalletAnalysis() {
  const params = useParams();
  const router = useRouter();
  const address = params.address as string;

  const { 
    currentWalletData, 
    analyzeWallet, 
    isAnalyzing, 
    savedAnalyses 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'professional' | 'roast' | 'eli5'>('professional');
  const [copied, setCopied] = useState(false);

  // Retrieve matching Walrus record for this wallet
  const currentBlobId = savedAnalyses.find(
    a => a.address.toLowerCase() === currentWalletData?.address.toLowerCase()
  )?.blobId || 'walrus-blob-default-sui-lens';

  useEffect(() => {
    if (address) {
      const decodedAddress = decodeURIComponent(address).toLowerCase();
      // Only trigger analysis if current data is empty or address mismatched
      if (!currentWalletData || currentWalletData.address.toLowerCase() !== decodedAddress) {
        analyzeWallet(decodedAddress).catch(console.error);
      }
    }
  }, [address, currentWalletData, analyzeWallet]);

  if (isAnalyzing || !currentWalletData) {
    return (
      <div className="py-12">
        <LoadingScanner />
      </div>
    );
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(currentWalletData.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format portfolio value
  const formattedUSD = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(currentWalletData.portfolioValueUSD);

  return (
    <div className="space-y-8 text-left">
      {/* Overview Top Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-[#0b1220]/40 p-6 rounded-2xl border border-white/5 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute w-[200px] h-[100px] rounded-full bg-cyan-glow/5 blur-[50px] top-0 left-0 pointer-events-none" />
        
        <div className="space-y-2 max-w-xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display font-extrabold text-2xl text-white tracking-wide">
              {currentWalletData.ensName || 'Sui Wallet'}
            </span>
            <span className="font-sans text-xs tracking-wider uppercase font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/5 text-cyan-glow">
              {currentWalletData.tag}
            </span>
            
            {/* Walrus proof badge */}
            <WalrusStorageBadge blobId={currentBlobId} />
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-white/50 bg-[#050816] px-3 py-1.5 rounded-lg border border-white/5 max-w-md">
            <span className="truncate flex-1">{currentWalletData.address}</span>
            <button 
              onClick={handleCopyAddress}
              className="text-cyan-glow hover:text-white transition-colors cursor-pointer"
            >
              {copied ? 'Copied' : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Total Value snapshot block */}
        <div className="text-left lg:text-right space-y-1">
          <span className="text-[10px] font-display font-semibold tracking-wider text-white/40 uppercase">Net Portfolio Value</span>
          <h2 className="font-display font-extrabold text-3xl text-white glow-text-cyan">{formattedUSD}</h2>
          <div className="flex items-center lg:justify-end gap-1.5 text-xs text-success-green">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+15.2% (24h growth)</span>
          </div>
        </div>
      </div>

      {/* Grid 1: Circular Score + AI Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Circular Ring */}
        <div className="lg:col-span-4 h-full">
          <RiskScoreRing score={currentWalletData.riskScore} />
        </div>

        {/* Right AI Explanation Card */}
        <div className="lg:col-span-8 glass-panel border-cyan-glow/15 p-6 rounded-2xl h-full flex flex-col justify-between relative overflow-hidden">
          {/* Top Panel Tab Toggles */}
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-glow animate-pulse" />
                <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">AI Copilot Analysis Summary</h3>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-sans text-[10px] text-white/40 uppercase font-semibold">Confidence:</span>
                <span className="font-mono text-[10px] font-bold text-success-green bg-success-green/10 px-2 py-0.5 rounded">
                  {currentWalletData.confidenceScore}%
                </span>
              </div>
            </div>

            {/* Mode selection buttons */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('professional')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer
                  ${activeTab === 'professional' 
                    ? 'bg-cyan-glow/15 border border-cyan-glow/30 text-white' 
                    : 'bg-white/2 hover:bg-white/5 border border-white/5 text-white/50 hover:text-white'
                  }
                `}
              >
                <Brain className="w-3.5 h-3.5" />
                Professional Summary
              </button>

              <button
                onClick={() => setActiveTab('roast')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer
                  ${activeTab === 'roast' 
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' 
                    : 'bg-white/2 hover:bg-white/5 border border-white/5 text-white/50 hover:text-white'
                  }
                `}
              >
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                AI Roast Mode 🔥
              </button>

              <button
                onClick={() => setActiveTab('eli5')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer
                  ${activeTab === 'eli5' 
                    ? 'bg-purple-glow/15 border border-purple-glow/30 text-purple-glow' 
                    : 'bg-white/2 hover:bg-white/5 border border-white/5 text-white/50 hover:text-white'
                  }
                `}
              >
                <Smile className="w-3.5 h-3.5" />
                Explain Like I'm 5
              </button>
            </div>

            {/* Paragraph rendering with custom animations */}
            <div className="min-h-[140px] text-sm text-white/80 font-sans leading-relaxed text-left">
              {activeTab === 'professional' && <p>{currentWalletData.summaryProfessional}</p>}
              {activeTab === 'roast' && (
                <div className="bg-rose-500/5 p-4 rounded-xl border border-rose-500/20 text-rose-300 font-sans">
                  <p>🔥 {currentWalletData.summaryRoast}</p>
                </div>
              )}
              {activeTab === 'eli5' && <p>👶 {currentWalletData.summaryExplainLike5}</p>}
            </div>
          </div>

          <div className="flex gap-4 pt-6 mt-4 border-t border-white/5">
            <button 
              onClick={() => router.push(`/chat?address=${currentWalletData.address}`)}
              className="flex-1 bg-gradient-to-r from-cyan-glow to-sui-blue hover:from-sui-blue hover:to-cyan-glow text-[#050816] font-display font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer text-center"
            >
              Ask AI Follow-Up Questions
            </button>
          </div>
        </div>
      </div>

      {/* Grid 2: Token Allocations & Risk Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Token Allocation charts */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4">
            <Coins className="w-5 h-5 text-cyan-glow" />
            <h3 className="font-display font-bold text-base text-white">Asset Allocation Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Pie Chart display using Recharts */}
            <div className="sm:col-span-5 h-36 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentWalletData.tokenAllocations}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={3}
                    dataKey="valueUSD"
                  >
                    {currentWalletData.tokenAllocations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#0b1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff', fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="font-display font-bold text-xs text-white/55">TOKS</span>
              </div>
            </div>

            {/* Allocation listing progress rows */}
            <div className="sm:col-span-7 space-y-3">
              {currentWalletData.tokenAllocations.map((tok) => (
                <div key={tok.symbol} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tok.color }} />
                      <span className="text-white/80">{tok.symbol}</span>
                    </div>
                    <span className="font-mono text-white/90">
                      {tok.percentage}% 
                      <span className="text-white/40 text-[10px] font-sans ml-1">${tok.valueUSD.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${tok.percentage}%`, backgroundColor: tok.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Risk Warning list */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-2">
            <Shield className="w-5 h-5 text-cyan-glow" />
            <h3 className="font-display font-bold text-base text-white">Verified Security Indicators</h3>
          </div>

          <div className="space-y-3.5">
            {currentWalletData.riskIndicators.map((ind, idx) => (
              <div 
                key={idx} 
                className={`flex gap-4 p-3.5 rounded-xl border text-left
                  ${ind.severity === 'high' 
                    ? 'bg-rose-500/5 border-rose-500/20 text-rose-200' 
                    : ind.severity === 'medium' 
                    ? 'bg-amber-500/5 border-amber-500/20 text-amber-200' 
                    : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-200'
                  }
                `}
              >
                <div className="mt-0.5 shrink-0">
                  <Shield className={`w-4.5 h-4.5
                    ${ind.severity === 'high' ? 'text-rose-500 animate-pulse' : ind.severity === 'medium' ? 'text-amber-500' : 'text-emerald-500'}
                  `} />
                </div>
                <div className="space-y-1">
                  <span className="font-display font-bold text-xs uppercase tracking-wide">{ind.title}</span>
                  <p className="font-sans text-[11px] text-white/60 leading-relaxed">{ind.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ledger Activity Timeline */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
          <Activity className="w-5 h-5 text-cyan-glow" />
          <h3 className="font-display font-bold text-base text-white">Recent Ledger Transactions (Tatum API Verified)</h3>
        </div>

        <div className="relative border-l border-white/5 pl-6 ml-4 space-y-8 text-left">
          {currentWalletData.activityTimeline.map((item) => (
            <div key={item.id} className="relative group">
              {/* Timeline dot */}
              <div className={`absolute -left-[30px] top-1 w-2 h-2 rounded-full border transition-all duration-300
                ${item.isSuspicious 
                  ? 'bg-rose-500 border-rose-500 group-hover:scale-125 shadow-[0_0_8px_rgba(244,63,94,0.6)]' 
                  : 'bg-cyan-glow border-cyan-glow group-hover:scale-125 shadow-[0_0_8px_rgba(0,209,255,0.6)]'
                }
              `} />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 text-xs">
                    <span className="font-display font-bold uppercase tracking-wider text-white">
                      {item.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-white/40">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                    {item.isSuspicious && (
                      <span className="font-display font-bold text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 uppercase tracking-widest animate-pulse">
                        Unverified Pool
                      </span>
                    )}
                  </div>
                  
                  <div className="font-sans text-xs text-white/60 flex flex-wrap items-center gap-1.5">
                    {item.type === 'swap' && item.tokenIn && (
                      <>
                        Swapped <span className="font-mono text-white font-semibold">{item.amountIn} {item.tokenIn}</span> for{' '}
                        <span className="font-mono text-white font-semibold">{item.amountOut} {item.tokenOut}</span>
                      </>
                    )}
                    {item.type !== 'swap' && (
                      <>
                        Interacted with <span className="font-mono text-white font-semibold">{item.interactedWith}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-left sm:text-right">
                    <span className="font-mono text-xs font-bold text-white block">
                      ${item.amountUSD.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono text-white/40 block">
                      Hash: {item.hash}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-cyan-glow group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import RiskScoreRing from '@/components/RiskScoreRing';
import LoadingScanner from '@/components/LoadingScanner';
import WalrusStorageBadge from '@/components/WalrusStorageBadge';
import { 
  Shield, 
  TrendingUp, 
  Coins, 
  ChevronRight,
  Brain,
  Download,
  Copy,
  Database,
  Send,
  User,
  Bot,
  Cpu,
  Sparkles,
  ArrowRight,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { Cell, PieChart, Pie, ResponsiveContainer, Tooltip } from 'recharts';
import Link from 'next/link';

// Sleek lightweight React Markdown segment compiler
function MarkdownText({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        const isListItem = trimmed.startsWith('•') || trimmed.startsWith('-') || (trimmed.startsWith('*') && !trimmed.startsWith('**'));
        const cleanLine = isListItem 
          ? trimmed.substring(1).trim() 
          : line;

        const regex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;
        const segments = cleanLine.split(regex);
        const processedSegments: React.ReactNode[] = [];

        segments.forEach((seg, sIdx) => {
          if (seg.startsWith('**') && seg.endsWith('**')) {
            processedSegments.push(
              <strong key={sIdx} className="font-bold text-cyan-glow">
                {seg.substring(2, seg.length - 2)}
              </strong>
            );
          } else if (seg.startsWith('`') && seg.endsWith('`')) {
            processedSegments.push(
              <code key={sIdx} className="font-mono bg-[#050816] px-1 py-0.5 rounded text-cyan-glow border border-white/5 text-[10px] tracking-wide">
                {seg.substring(1, seg.length - 1)}
              </code>
            );
          } else if (seg.startsWith('[') && seg.includes('](') && seg.endsWith(')')) {
            const label = seg.substring(1, seg.indexOf(']('));
            const url = seg.substring(seg.indexOf('](') + 2, seg.length - 1);
            processedSegments.push(
              <a 
                key={sIdx} 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-cyan-glow underline hover:text-white transition-colors"
              >
                {label}
              </a>
            );
          } else {
            processedSegments.push(<span key={sIdx}>{seg}</span>);
          }
        });

        if (isListItem) {
          return (
            <div key={idx} className="flex gap-2 items-start pl-2 text-xs">
              <span className="text-cyan-glow shrink-0 mt-1.5 text-[8px]">•</span>
              <div className="flex-1 leading-relaxed">{processedSegments}</div>
            </div>
          );
        }

        return (
          <p key={idx} className="min-h-[1.1rem] leading-relaxed text-xs text-white/80">
            {processedSegments}
          </p>
        );
      })}
    </div>
  );
}

export default function MyPortfolioPage() {
  const { 
    connectedWallet, 
    currentWalletData, 
    analyzeWallet, 
    isAnalyzing,
    chatThreads,
    addChatMessage,
    savedAnalyses
  } = useStore();

  const [activeTab, setActiveTab] = useState<'details' | 'staking' | 'lending'>('details');
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto trigger scan on connectedWallet when mounted
  useEffect(() => {
    if (connectedWallet) {
      const decodedAddress = decodeURIComponent(connectedWallet).toLowerCase();
      // Fetch details only if mismatched
      if (!currentWalletData || currentWalletData.address.toLowerCase() !== decodedAddress) {
        analyzeWallet(decodedAddress).catch(console.error);
      }
    }
  }, [connectedWallet, currentWalletData, analyzeWallet]);

  // Scroll AI Chat to bottom
  const messages = connectedWallet ? (chatThreads[connectedWallet.toLowerCase()] || []) : [];
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isReplying]);

  if (!connectedWallet) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] text-center max-w-xl mx-auto">
        <div className="glass-panel p-8 rounded-3xl border border-cyan-glow/20 space-y-6 relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-cyan-glow/10 blur-3xl pointer-events-none" />
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-glow/10 border border-cyan-glow/30 flex items-center justify-center text-cyan-glow animate-pulse">
              <Coins className="w-8 h-8" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-2xl text-white tracking-wide">No Connected Wallet</h2>
            <p className="font-sans text-xs text-white/40 uppercase tracking-widest">Awaiting public key handshake</p>
          </div>
          <p className="font-sans text-sm text-white/70">
            Please connect your self-custodial Sui wallet using the top-right navbar trigger to view your own live portfolio telemetry and yield optimizations.
          </p>
        </div>
      </div>
    );
  }

  if (isAnalyzing || !currentWalletData || currentWalletData.address.toLowerCase() !== connectedWallet.toLowerCase()) {
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

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isReplying) return;

    const queryText = chatInput;
    setChatInput('');
    setIsReplying(true);

    try {
      await addChatMessage(connectedWallet.toLowerCase(), { role: 'user', content: queryText });
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'AI Copilot suffered a reasoning lapse. Please try again.');
    } finally {
      setIsReplying(false);
    }
  };

  const formattedUSD = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(currentWalletData.portfolioValueUSD);

  // Mock yields and DeFi variables calculated for layouts
  const totalStakedSui = currentWalletData.tokenAllocations.find(t => t.symbol.includes('Staked'))?.balance || 0;
  const isStakingActive = totalStakedSui > 0;
  const isLendingActive = currentWalletData.riskIndicators.some(r => r.title.includes('Lending'));

  return (
    <div className="space-y-8 text-left">
      {/* Portfolio Top Command Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-[#0b1220]/40 p-6 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute w-[200px] h-[100px] rounded-full bg-cyan-glow/5 blur-[50px] top-0 left-0 pointer-events-none" />
        
        <div className="space-y-2 max-w-xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display font-extrabold text-2xl text-white tracking-wide">
              {currentWalletData.ensName || 'My Sui Wallet'}
            </span>
            <span className="font-sans text-[10px] tracking-wider uppercase font-bold px-3 py-1 rounded-full bg-cyan-glow/10 border border-cyan-glow/20 text-cyan-glow">
              {currentWalletData.tag}
            </span>
            <WalrusStorageBadge blobId={savedAnalyses.find(a => a.address.toLowerCase() === currentWalletData.address.toLowerCase())?.blobId || 'walrus-blob-default-sui-lens'} />
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

        {/* Financial metrics block */}
        <div className="text-left lg:text-right space-y-1">
          <span className="text-[10px] font-display font-semibold tracking-wider text-white/40 uppercase">Total Net Equity</span>
          <h2 className="font-display font-extrabold text-3xl text-white glow-text-cyan">{formattedUSD}</h2>
          <div className="flex items-center lg:justify-end gap-1.5 text-xs text-success-green">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+15.2% (24h Growth)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Audit and AI Chat side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Section: Visuals, Staking, Lending details (7 columns) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Tab Toggles for details */}
          <div className="flex gap-2.5 border-b border-white/5 pb-4">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-5 py-2.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer
                ${activeTab === 'details' 
                  ? 'bg-cyan-glow/15 border border-cyan-glow/30 text-white' 
                  : 'bg-white/2 hover:bg-white/5 border border-white/5 text-white/50 hover:text-white'
                }
              `}
            >
              Portfolio Allocation
            </button>
            <button
              onClick={() => setActiveTab('staking')}
              className={`px-5 py-2.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer
                ${activeTab === 'staking' 
                  ? 'bg-purple-glow/15 border border-purple-glow/30 text-purple-glow' 
                  : 'bg-white/2 hover:bg-white/5 border border-white/5 text-white/50 hover:text-white'
                }
              `}
            >
              Sui Staking Breakdown
            </button>
            <button
              onClick={() => setActiveTab('lending')}
              className={`px-5 py-2.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer
                ${activeTab === 'lending' 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                  : 'bg-white/2 hover:bg-white/5 border border-white/5 text-white/50 hover:text-white'
                }
              `}
            >
              DeFi Yield Lending
            </button>
          </div>

          {/* TAB 1: Asset allocations with Pie Chart */}
          {activeTab === 'details' && (
            <div className="glass-panel p-6 rounded-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-cyan-glow" />
                  <h3 className="font-display font-bold text-base text-white">Visual Allocations Profile</h3>
                </div>
                <Link
                  href={`/reports?address=${currentWalletData.address}&download=true`}
                  className="flex items-center gap-1.5 text-xs text-cyan-glow hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download A4 Brief</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Recharts Pie */}
                <div className="sm:col-span-5 h-44 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={currentWalletData.tokenAllocations}
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={56}
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="font-display font-black text-xs text-white glow-text-cyan">PORT</span>
                    <span className="font-sans text-[8px] text-white/40 uppercase">Allocation</span>
                  </div>
                </div>

                {/* Progress rows */}
                <div className="sm:col-span-7 space-y-3">
                  {currentWalletData.tokenAllocations.map((tok, idx) => (
                    <div key={`${tok.symbol}-${idx}`} className="space-y-1">
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
          )}

          {/* TAB 2: Staking Breakdown */}
          {activeTab === 'staking' && (
            <div className="glass-panel p-6 rounded-2xl space-y-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <Sparkles className="w-5 h-5 text-purple-glow animate-pulse" />
                <h3 className="font-display font-bold text-base text-white">Sui Ledger Validator Staking</h3>
              </div>

              {isStakingActive ? (
                <div className="space-y-5">
                  <div className="bg-[#0b1220]/60 p-5 rounded-2xl border border-purple-glow/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
                    <div className="space-y-1">
                      <span className="font-display font-extrabold text-[8px] text-purple-glow tracking-widest uppercase">Active Native Stakes</span>
                      <h4 className="font-display font-bold text-lg text-white">Sui Mainnet Validator Pool</h4>
                      <p className="font-sans text-[11px] text-white/60">Distributed across highly robust system nodes.</p>
                    </div>
                    <div className="text-left sm:text-right space-y-1">
                      <span className="text-[8px] font-display font-semibold tracking-wider text-white/30 uppercase block">Total Staking Asset</span>
                      <span className="font-mono text-xl font-bold text-white block glow-text-purple">
                        {totalStakedSui.toLocaleString(undefined, { maximumFractionDigits: 2 })} SUI
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Native Staking details */}
                    <div className="bg-white/2 border border-white/5 p-4 rounded-xl space-y-2">
                      <span className="text-[9px] font-display font-bold text-white/40 uppercase tracking-wide block">Validator allocation</span>
                      <div className="flex justify-between items-center text-xs font-mono text-white/80">
                        <span className="font-sans">Haedal Validator Node</span>
                        <span className="font-bold text-success-green">4.8% APY</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono text-white/80">
                        <span className="font-sans">Liquid Stake reserves</span>
                        <span className="font-bold text-purple-glow">5.2% APY</span>
                      </div>
                    </div>
                    
                    {/* Rewards detail */}
                    <div className="bg-white/2 border border-white/5 p-4 rounded-xl space-y-2">
                      <span className="text-[9px] font-display font-bold text-white/40 uppercase tracking-wide block">Estimated yield logs</span>
                      <div className="flex justify-between items-center text-xs font-mono text-white/80">
                        <span className="font-sans">Annualized Earnings</span>
                        <span className="font-bold text-white">+${(totalStakedSui * 2.10 * 0.05).toFixed(2)} USD</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono text-white/80">
                        <span className="font-sans">Accumulated Premiums</span>
                        <span className="font-bold text-cyan-glow">haSUI Liquid</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white/2 rounded-2xl border border-dashed border-white/5 space-y-3">
                  <Cpu className="w-10 h-10 text-white/20 mx-auto" />
                  <p className="font-sans text-xs text-white/40 uppercase tracking-wider">No active native validator stakes detected</p>
                  <p className="font-sans text-xs text-white/60 max-w-sm mx-auto leading-relaxed">
                    Improve SUI network security and unlock up to 5% APY rewards by staking SUI to active validators.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Yield Lending */}
          {activeTab === 'lending' && (
            <div className="glass-panel p-6 rounded-2xl space-y-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="font-display font-bold text-base text-white">DeFi Lending Pools Exposure</h3>
              </div>

              {isLendingActive ? (
                <div className="space-y-4">
                  {/* Scallop details */}
                  <div className="flex justify-between items-center p-4 rounded-xl border border-white/5 bg-white/2 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all text-left">
                    <div className="space-y-1">
                      <span className="font-display font-bold text-xs text-white block">Scallop Protocol Supply</span>
                      <span className="font-sans text-[10px] text-white/40 uppercase tracking-widest font-semibold block">Liquidity Provisioning</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-white block">150 SUI</span>
                      <span className="font-mono text-[10px] font-bold text-emerald-400">4.2% APY</span>
                    </div>
                  </div>

                  {/* Navi details */}
                  <div className="flex justify-between items-center p-4 rounded-xl border border-white/5 bg-white/2 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all text-left">
                    <div className="space-y-1">
                      <span className="font-display font-bold text-xs text-white block">Navi protocol Reserves</span>
                      <span className="font-sans text-[10px] text-white/40 uppercase tracking-widest font-semibold block">Stablecoin Reserves</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-white block">100 USDC</span>
                      <span className="font-mono text-[10px] font-bold text-emerald-400">6.5% APY</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white/2 rounded-2xl border border-dashed border-white/5 space-y-3">
                  <Database className="w-10 h-10 text-white/20 mx-auto" />
                  <p className="font-sans text-xs text-white/40 uppercase tracking-wider">No active lending pools deposits detected</p>
                  <p className="font-sans text-xs text-white/60 max-w-sm mx-auto leading-relaxed">
                    Provide supply liquidity into Navi or Scallop protocols to earn interest yields on USDC, USDT, and SUI primitives.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Security alerts tailored for connected user */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              <Shield className="w-5 h-5 text-cyan-glow" />
              <h3 className="font-display font-bold text-base text-white">Your Security Health Matrix</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-white/5 bg-white/2">
                <span className="text-[9px] font-display font-bold text-white/40 uppercase tracking-wider block">Connected Risk Score</span>
                <span className="font-mono text-2xl font-black text-white glow-text-cyan mt-1 block">
                  {currentWalletData.riskScore}%
                </span>
                <span className="text-[10px] text-white/50 block mt-1.5">No immediate contract threat detected.</span>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-white/2">
                <span className="text-[9px] font-display font-bold text-white/40 uppercase tracking-wider block">Active Alerts</span>
                <span className="font-mono text-2xl font-black text-success-green mt-1 block">
                  {currentWalletData.riskIndicators.filter(r => r.severity === 'high').length} High
                </span>
                <span className="text-[10px] text-white/50 block mt-1.5">Your SUI registry is safe and clean.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: On-Page AI Copilot chat (5 columns) */}
        <div className="lg:col-span-5 h-[calc(100vh-200px)] lg:sticky lg:top-24 flex flex-col justify-between glass-panel border-cyan-glow/15 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute w-[200px] h-[100px] rounded-full bg-cyan-glow/5 blur-[50px] -top-12 -right-12 pointer-events-none" />
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4 shrink-0">
            <div className="flex items-center gap-2">
              <Brain className="w-4.5 h-4.5 text-cyan-glow animate-pulse" />
              <span className="font-display font-bold text-xs uppercase tracking-widest text-white">Portfolio AI Copilot</span>
            </div>
            <span className="font-mono text-[9px] font-bold text-success-green bg-success-green/10 px-2 py-0.5 rounded">
              ONLINE
            </span>
          </div>

          {/* Chat scrolling block */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-4 my-auto">
                <MessageSquare className="w-8 h-8 text-white/20" />
                <div className="space-y-1">
                  <p className="font-display font-bold text-white text-xs">Ask anything about your assets</p>
                  <p className="font-sans text-white/40 leading-relaxed text-[11px]">
                    "How can I optimize my haSUI staking rewards?" or "Show my DeFi risk exposures in Navi."
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-2.5 text-left ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role !== 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-glow to-purple-glow flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-[#050816]" />
                    </div>
                  )}
                  <div className={`p-3 rounded-2xl leading-relaxed max-w-[85%]
                    ${msg.role === 'user' 
                      ? 'bg-cyan-glow/10 border border-cyan-glow/20 text-white rounded-tr-none' 
                      : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
                    }
                  `}>
                    {msg.role === 'user' ? (
                      <p>{msg.content}</p>
                    ) : (
                      <MarkdownText content={msg.content} />
                    )}
                  </div>
                </div>
              ))
            )}

            {isReplying && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-glow to-purple-glow flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-[#050816] animate-spin" />
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-white/40 animate-bounce"></span>
                  <span className="w-1 h-1 rounded-full bg-white/40 animate-bounce delay-100"></span>
                  <span className="w-1 h-1 rounded-full bg-white/40 animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt quick items */}
          {messages.length === 0 && (
            <div className="pt-3 border-t border-white/5 shrink-0 space-y-2">
              <span className="text-[8px] font-display font-semibold tracking-wider text-white/30 uppercase block">Quick Prompts</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    setChatInput("Analyze if my SUI staking allocations are optimal.");
                  }}
                  className="text-left font-sans text-[10px] p-2 rounded-lg border border-white/5 bg-white/2 hover:bg-cyan-glow/5 hover:border-cyan-glow/20 text-white/60 hover:text-white transition-all cursor-pointer truncate"
                >
                  Optimize Stakes APY
                </button>
                <button
                  onClick={() => {
                    setChatInput("Give me a risk profile review of my DeFi exposures.");
                  }}
                  className="text-left font-sans text-[10px] p-2 rounded-lg border border-white/5 bg-white/2 hover:bg-cyan-glow/5 hover:border-cyan-glow/20 text-white/60 hover:text-white transition-all cursor-pointer truncate"
                >
                  DeFi Risk Review
                </button>
              </div>
            </div>
          )}

          {/* Form input */}
          <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 shrink-0">
            <input 
              type="text" 
              placeholder="Ask your AI Portfolio advisor..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isReplying}
              className="flex-1 bg-[#0b1220]/60 border border-white/10 hover:border-cyan-glow/40 focus:border-cyan-glow text-white text-xs px-3.5 py-2.5 rounded-xl outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isReplying}
              className="p-2.5 rounded-xl bg-cyan-glow hover:bg-sui-blue disabled:bg-cyan-glow/20 disabled:text-[#050816]/30 text-[#050816] transition-all cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

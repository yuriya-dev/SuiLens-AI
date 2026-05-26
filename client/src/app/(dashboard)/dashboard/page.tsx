'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { 
  TrendingUp, 
  TrendingDown, 
  Cpu, 
  Activity, 
  AlertTriangle, 
  ExternalLink,
  ChevronRight,
  Shield,
  Eye
} from 'lucide-react';
import { generateRandomWhaleTx } from '@/lib/mockData';

export default function MainDashboard() {
  const { whaleFeed, addWhaleTx, savedAnalyses, fetchWhales, fetchHistory, simulateMode, openaiApiKey } = useStore();
  const [pulsePrice, setPulsePrice] = useState({ sui: 2.10, cetus: 0.35, deep: 0.06 });
  const [insights, setInsights] = useState<{ whaleInsight: string; riskInsight: string } | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);

  // Fetch dynamic AI insights on mount or when simulateMode / apiKey settings change
  useEffect(() => {
    const fetchAIInsights = async () => {
      setIsLoadingInsights(true);
      try {
        const res = await fetch('http://localhost:3001/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            settings: { simulateMode, openaiApiKey }
          })
        });
        if (res.ok) {
          const data = await res.json();
          setInsights(data);
        } else {
          console.error('Failed to retrieve AI insights, status:', res.status);
        }
      } catch (err) {
        console.error('Failed to fetch AI insights:', err);
      } finally {
        setIsLoadingInsights(false);
      }
    };

    fetchAIInsights();
  }, [simulateMode, openaiApiKey]);

  // Fetch initial telemetry from backend server
  useEffect(() => {
    fetchWhales();
    fetchHistory();
  }, [fetchWhales, fetchHistory]);

  // Fetch real-time market prices from Binance via the server gateway
  useEffect(() => {
    const fetchLivePrices = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/prices');
        if (res.ok) {
          const data = await res.json();
          setPulsePrice({
            sui: Number((data.SUI || 2.10).toFixed(3)),
            cetus: Number((data.CETUS || 0.35).toFixed(3)),
            deep: Number((data.DEEP || 0.06).toFixed(4))
          });
        }
      } catch (err) {
        console.error('Failed to fetch real-time market prices:', err);
      }
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 15000);
    return () => clearInterval(interval);
  }, []);

  // Connect live to the backend Server-Sent Events (SSE) transaction stream
  useEffect(() => {
    console.log('[Dashboard] Connecting to real-time transaction stream...');
    const eventSource = new EventSource('http://localhost:3001/api/whales/stream');

    eventSource.onmessage = (event) => {
      try {
        const tx = JSON.parse(event.data);
        console.log(`[Dashboard] Incoming transfer: $${tx.amountUSD.toLocaleString()} USD`);
        addWhaleTx(tx);
      } catch (err) {
        console.error('[Dashboard] Fail parsing stream transaction:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('[Dashboard] EventSource stream connection error:', err);
    };

    return () => {
      console.log('[Dashboard] Closing real-time transaction stream.');
      eventSource.close();
    };
  }, [addWhaleTx]);

  // Deduplicate savedAnalyses by address to only show the latest snapshot for each unique address
  const uniqueAnalysesList: typeof savedAnalyses = [];
  const seenAddresses = new Set<string>();
  savedAnalyses.forEach(analysis => {
    const addr = analysis.address.toLowerCase();
    if (!seenAddresses.has(addr)) {
      seenAddresses.add(addr);
      uniqueAnalysesList.push(analysis);
    }
  });

  const smartWallets = uniqueAnalysesList.length > 0
    ? uniqueAnalysesList.slice(0, 5).map(analysis => {
        const shortAddr = `${analysis.address.slice(0, 6)}...${analysis.address.slice(-4)}`;
        const risk = analysis.riskScore;
        const tag = risk < 30 ? 'Low Risk' : risk < 70 ? 'Active Holder' : 'High Risk';
        return {
          name: shortAddr,
          address: analysis.address,
          value: `$${((analysis.sizeBytes || 15000) * 8.2).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
          risk: risk,
          tag: tag
        };
      })
    : [
        { name: 'smartmoney.sui', address: '0x981ba24f6b0c2eef9ba7582eb7bc3696f018888b1', value: '$1.45M', risk: 14, tag: 'Smart Whale' },
        { name: 'yieldfarmer.sui', address: '0x3c2fa56b0c2eef9ba7582eb7bc3696f018882fd', value: '$312K', risk: 28, tag: 'DeFi Degen' },
        { name: 'degentrader.sui', address: '0xde202f5a6b0c2eef9ba7582eb7bc3696f018889a', value: '$24.5K', risk: 88, tag: 'High Risk' }
      ];

  return (
    <div className="space-y-8 text-left">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-white tracking-wide">
            Onchain Intelligence Dashboard
          </h1>
          <p className="font-sans text-xs text-white/40 uppercase tracking-widest mt-1">
            Real-time analytics portal of the Sui ecosystem
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#0b1220]/60 px-4 py-2.5 rounded-xl border border-white/5 font-mono text-xs text-cyan-glow">
          <Activity className="w-3.5 h-3.5 text-cyan-glow animate-pulse" />
          <span>LEDGER STREAM: SYNCHRONIZED</span>
        </div>
      </div>

      {/* Grid 1: Market Pulse Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget SUI */}
        <div className="glass-panel-cyan p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-display font-semibold tracking-wider text-white/40 uppercase">SUI Token</span>
              <h3 className="font-display font-extrabold text-2xl text-white mt-1">${pulsePrice.sui}</h3>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-display font-bold text-success-green px-2 py-0.5 rounded-md bg-success-green/10">
              <TrendingUp className="w-3 h-3" />
              +4.8%
            </span>
          </div>
          <div className="mt-4 h-8 flex items-end gap-1 pointer-events-none">
            {/* Simple static sparkline simulation */}
            <div className="w-full h-1 bg-gradient-to-r from-cyan-glow/20 via-sui-blue to-cyan-glow shadow-[0_0_8px_rgba(0,209,255,0.3)] rounded-full" />
          </div>
        </div>

        {/* Widget CETUS */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-display font-semibold tracking-wider text-white/40 uppercase">CETUS Token</span>
              <h3 className="font-display font-extrabold text-2xl text-white mt-1">${pulsePrice.cetus}</h3>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-display font-bold text-success-green px-2 py-0.5 rounded-md bg-success-green/10">
              <TrendingUp className="w-3 h-3" />
              +12.4%
            </span>
          </div>
          <div className="mt-4 h-8 flex items-end gap-1 pointer-events-none">
            <div className="w-full h-1 bg-gradient-to-r from-purple-glow/20 via-purple-glow to-purple-glow shadow-[0_0_8px_rgba(139,92,246,0.3)] rounded-full" />
          </div>
        </div>

        {/* Widget DEEP */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-display font-semibold tracking-wider text-white/40 uppercase">DEEPBook Token</span>
              <h3 className="font-display font-extrabold text-2xl text-white mt-1">${pulsePrice.deep}</h3>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-display font-bold text-rose-500 px-2 py-0.5 rounded-md bg-rose-500/10">
              <TrendingDown className="w-3 h-3" />
              -2.1%
            </span>
          </div>
          <div className="mt-4 h-8 flex items-end gap-1 pointer-events-none">
            <div className="w-full h-1 bg-white/10 rounded-full" />
          </div>
        </div>
      </div>

      {/* Grid 2: AI Insights & Quick List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: AI Market Pulse Insights */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
              <Cpu className="w-5 h-5 text-cyan-glow animate-pulse" />
              <h3 className="font-display font-bold text-base text-white">SuiLens AI Ecosystem Insight</h3>
            </div>
            {isLoadingInsights ? (
              <div className="space-y-4 py-2">
                <div className="flex items-start gap-2.5 animate-pulse">
                  <div className="w-4 h-4 rounded-full bg-white/10 mt-1 shrink-0" />
                  <div className="space-y-2 w-full">
                    <div className="h-4 bg-white/10 rounded w-1/4" />
                    <div className="h-3.5 bg-white/5 rounded w-5/6" />
                    <div className="h-3.5 bg-white/5 rounded w-4/5" />
                  </div>
                </div>
                <div className="flex items-start gap-2.5 animate-pulse mt-4">
                  <div className="w-4 h-4 rounded-full bg-white/10 mt-1 shrink-0" />
                  <div className="space-y-2 w-full">
                    <div className="h-4 bg-white/10 rounded w-1/4" />
                    <div className="h-3.5 bg-white/5 rounded w-11/12" />
                    <div className="h-3.5 bg-white/5 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ) : insights ? (
              <div className="space-y-4 text-sm font-sans text-white/70 leading-relaxed">
                <p>
                  💡 <span className="text-white font-semibold">Whale Flow:</span> {insights.whaleInsight}
                </p>
                <p>
                  ⚠️ <span className="text-warning-orange font-semibold">Risk Warning:</span> {insights.riskInsight}
                </p>
              </div>
            ) : (
              <div className="text-xs text-white/40 italic py-2">
                No insights could be synthesized at this time. Please check your network connection or settings.
              </div>
            )}
          </div>

          {/* Whale Feed alerts summary */}
          <div className="glass-panel p-6 rounded-2xl relative">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-glow" />
                <h3 className="font-display font-bold text-base text-white">Live Large Transaction Alert Feed</h3>
              </div>
              <Link href="/whales" className="text-xs text-cyan-glow hover:underline flex items-center gap-1 cursor-pointer">
                View Full Feed <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            <div className="space-y-3.5">
              {whaleFeed.slice(0, 4).map((tx) => (
                <div 
                  key={tx.id} 
                  className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-xl border transition-all
                    ${tx.isSuspicious 
                      ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40' 
                      : 'bg-white/2 border-white/5 hover:border-white/10'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`w-2 h-2 rounded-full ${tx.isSuspicious ? 'bg-rose-500 animate-ping' : 'bg-cyan-glow'}`} />
                    <span className="font-semibold text-white/90">
                      {tx.senderName || tx.sender.slice(0, 8)} ➔ {tx.receiverName || tx.receiver.slice(0, 8)}
                    </span>
                    <span className="text-white/40 uppercase tracking-widest text-[9px] font-display px-2 py-0.5 rounded bg-white/5 border border-white/5">
                      {tx.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 sm:mt-0">
                    <span className="font-mono text-xs font-bold text-white">
                      {tx.amount.toLocaleString()} {tx.token} 
                      <span className="text-white/40 text-[10px] font-sans ml-1">(${tx.amountUSD.toLocaleString()})</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/30 font-mono bg-white/5 px-2 py-0.5 rounded">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </span>
                      <a 
                        href={`https://suiscan.xyz/mainnet/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded bg-white/5 border border-white/5 hover:bg-cyan-glow/10 hover:border-cyan-glow/30 text-white/40 hover:text-cyan-glow transition-all"
                        title="View on Suiscan"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Smart Wallets & Search Hook */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-display font-bold text-base text-white border-b border-white/5 pb-3">
              Monitored Smart Wallets
            </h3>
            
            <div className="space-y-3.5 text-left">
              {smartWallets.map((wallet, idx) => (
                <div
                  key={`${wallet.address}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/2 hover:bg-cyan-glow/5 hover:border-cyan-glow/30 transition-all group"
                >
                  <Link
                    href={`/wallet/${wallet.address}`}
                    className="flex items-center justify-between flex-1 cursor-pointer"
                  >
                    <div className="space-y-1">
                      <span className="font-display font-bold text-xs text-white/90 group-hover:text-cyan-glow transition-colors">
                        {wallet.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-[10px] text-white/40 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded">
                          {wallet.tag}
                        </span>
                      </div>
                    </div>

                    <div className="text-right space-y-1 mr-4">
                      <span className="font-mono text-xs font-bold text-white">{wallet.value}</span>
                      <div className="flex items-center gap-1.5 justify-end">
                        <Shield className={`w-3 h-3 ${wallet.risk < 30 ? 'text-success-green' : wallet.risk < 70 ? 'text-warning-orange' : 'text-danger-red'}`} />
                        <span className={`font-mono text-[10px] font-bold ${wallet.risk < 30 ? 'text-success-green' : wallet.risk < 70 ? 'text-warning-orange' : 'text-danger-red'}`}>
                          Risk: {wallet.risk}%
                        </span>
                      </div>
                    </div>
                  </Link>

                  <a 
                    href={`https://suiscan.xyz/mainnet/account/${wallet.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-cyan-glow/10 hover:border-cyan-glow/30 text-white/40 hover:text-cyan-glow transition-all"
                    title="View Address on Suiscan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Walrus status card */}
          <div className="glass-panel-purple p-6 rounded-2xl relative text-left space-y-3.5">
            <div className="flex items-center gap-2 text-purple-glow">
              <Shield className="w-5 h-5 text-purple-glow animate-pulse" />
              <span className="font-display font-extrabold text-xs uppercase tracking-widest">Walrus Memory Log</span>
            </div>
            <p className="font-sans text-xs text-white/60 leading-relaxed">
              Decentralized archive represents <span className="text-purple-glow font-semibold">{savedAnalyses.length} audited reports</span> saved permanently in immutable blobs.
            </p>
            <Link 
              href="/history"
              className="flex items-center justify-center gap-1.5 w-full bg-purple-glow/10 hover:bg-purple-glow text-purple-glow hover:text-[#050816] py-2 rounded-xl border border-purple-glow/20 transition-all font-display font-bold uppercase tracking-wider text-[10px] cursor-pointer"
            >
              <span>Explore Storage History</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

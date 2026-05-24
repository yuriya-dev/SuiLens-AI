'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import WalrusStorageBadge from '@/components/WalrusStorageBadge';
import { 
  History, 
  Search, 
  Database, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function WalrusHistory() {
  const { savedAnalyses, fetchHistory } = useStore();
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredAnalyses = savedAnalyses.filter(item => 
    item.address.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-white tracking-wide flex items-center gap-2">
            <Database className="w-8 h-8 text-purple-glow" />
            Walrus Storage History
          </h1>
          <p className="font-sans text-xs text-white/40 uppercase tracking-widest mt-1">
            Immutable archive of cryptographically signed AI portfolio reports
          </p>
        </div>

        {/* Inline Search Bar */}
        <div className="w-full md:w-64 relative group">
          <input 
            type="text" 
            placeholder="Search address..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-[#0b1220]/60 border border-white/10 group-hover:border-cyan-glow/50 focus:border-cyan-glow text-white text-xs pl-9 pr-4 py-2 rounded-xl outline-none transition-all"
          />
          <Search className="w-3.5 h-3.5 text-white/30 group-focus-within:text-cyan-glow absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Cryptographic explanation card */}
      <div className="glass-panel-purple p-6 rounded-2xl space-y-3 relative overflow-hidden">
        <div className="absolute w-[200px] h-[100px] rounded-full bg-purple-glow/5 blur-[50px] top-0 left-0 pointer-events-none" />
        <div className="flex items-center gap-2 text-purple-glow font-display font-extrabold text-xs uppercase tracking-widest">
          <Database className="w-4.5 h-4.5 animate-pulse" />
          <span>Decentralized Availability Proofs</span>
        </div>
        <p className="font-sans text-xs text-white/60 leading-relaxed">
          Every time a wallet is analyzed, a research artifact is generated. This asset is published onto the **Walrus** decentralized storage network. The system assigns a unique Content Addressable **Blob Reference ID**, storing structured JSON snapshots. The record is permanently persistent, public, and verifiable.
        </p>
      </div>

      {/* Main List Table */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        {filteredAnalyses.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <History className="w-10 h-10 text-white/20 mx-auto" />
            <h4 className="font-display font-bold text-white">No Audits Found</h4>
            <p className="font-sans text-xs text-white/40">Try searching for another wallet or pasting a new address above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnalyses.map((item) => (
              <div 
                key={item.blobId}
                className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/4 hover:border-cyan-glow/20 transition-all gap-6 text-left"
              >
                {/* Target Address Info */}
                <div className="space-y-2 max-w-sm">
                  <Link 
                    href={`/wallet/${item.address}`}
                    className="font-display font-bold text-xs text-white hover:text-cyan-glow flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>{item.address.slice(0, 14)}...{item.address.slice(-6)}</span>
                    <ExternalLink className="w-3 h-3 text-white/30" />
                  </Link>
                  <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {/* Score badge & proofs */}
                <div className="flex flex-wrap items-center gap-4 lg:gap-8">
                  {/* Risk Score */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-display font-semibold tracking-wider text-white/40 uppercase block">Calculated Risk</span>
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded
                      ${item.riskScore < 30 ? 'bg-success-green/10 text-success-green' : item.riskScore < 70 ? 'bg-warning-orange/10 text-warning-orange' : 'bg-rose-500/10 text-rose-400'}
                    `}>
                      {item.riskScore}% Risk
                    </span>
                  </div>

                  {/* Blob hash */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-display font-semibold tracking-wider text-white/40 uppercase block">Blob Size</span>
                    <span className="font-mono text-xs text-white/70">{(item.sizeBytes / 1024).toFixed(2)} KB</span>
                  </div>

                  {/* Walrus proof badge component */}
                  <WalrusStorageBadge blobId={item.blobId} sizeBytes={item.sizeBytes} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

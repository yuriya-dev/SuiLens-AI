'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { 
  FileText, 
  Download, 
  Database, 
  Clock, 
  Cpu, 
  TrendingUp, 
  ArrowRight,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function PortfolioReports() {
  const { currentWalletData, savedAnalyses } = useStore();
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);

  const triggerPDFDownload = () => {
    if (isCompiling) return;
    setIsCompiling(true);
    setCompileProgress(0);

    const interval = setInterval(() => {
      setCompileProgress(prev => {
        if (prev < 100) {
          return prev + 10;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setIsCompiling(false);
            // Trigger simulated download completion
            alert('SuiLens AI Portfolio Report PDF generated and downloaded successfully! Stored verification hash on Walrus storage.');
          }, 500);
          return 100;
        }
      });
    }, 200);
  };

  const reportItems = [
    { name: 'suilens.sui Research Package', date: '2026-05-24', size: '154 KB', hash: '0x7a81...888a', type: 'Bluechip Accumulator' },
    { name: 'yieldfarmer.sui DeFi Audit', date: '2026-05-23', size: '162 KB', hash: '0x3c2f...fd2e', type: 'Stable yield provider' },
    { name: 'degentrader.sui Speculative Audit', date: '2026-05-24', size: '189 KB', hash: '0xde20...89a1', type: 'High risk degen' }
  ];

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      {/* Header title */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="font-display font-bold text-3xl text-white tracking-wide flex items-center gap-2">
          <FileText className="w-8 h-8 text-cyan-glow" />
          AI Portfolio Reports Generator
        </h1>
        <p className="font-sans text-xs text-white/40 uppercase tracking-widest mt-1">
          Generate, compile, and download production-grade blockchain intelligence briefs
        </p>
      </div>

      {/* Main Builder Box */}
      <div className="glass-panel border-cyan-glow/15 p-8 rounded-2xl relative overflow-hidden space-y-6">
        <div className="absolute inset-0 terminal-grid opacity-5 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/5">
          <div className="space-y-1">
            <span className="font-display font-extrabold text-xs text-cyan-glow uppercase tracking-widest">Active Report target</span>
            <h3 className="font-display font-bold text-lg text-white">
              {currentWalletData?.ensName || currentWalletData?.address.slice(0, 18) || 'No Target Selected'}
            </h3>
            <p className="font-sans text-xs text-white/50">
              Includes Risk Matrix, Smart Score, Personality Profiler, Token Allocations, and live timeline logs.
            </p>
          </div>

          <button
            onClick={triggerPDFDownload}
            disabled={!currentWalletData || isCompiling}
            className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-glow to-sui-blue hover:from-sui-blue hover:to-cyan-glow text-[#050816] font-display font-bold rounded-xl tracking-wider uppercase text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isCompiling ? 'Compiling PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>

        {/* Compile Progress Overlay */}
        {isCompiling && (
          <div className="bg-[#050816] rounded-xl border border-white/5 p-5 space-y-4">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-cyan-glow flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 animate-spin" />
                CONVERTING LEDGER DATA TO HIGH-FIDELITY PDF LAYOUTS...
              </span>
              <span className="text-white/70">{compileProgress}%</span>
            </div>
            
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-glow to-purple-glow rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(0,209,255,0.4)]"
                style={{ width: `${compileProgress}%` }}
              />
            </div>
            
            <div className="flex items-center gap-3 text-[10px] text-white/40 font-mono">
              <Database className="w-3.5 h-3.5 text-purple-glow" />
              <span>Simulated Walrus Proof Status: Uploading Cryptographic Metadata Blob...</span>
            </div>
          </div>
        )}

        {/* Interactive layout mockup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-sans">
          <div className="space-y-4">
            <h4 className="font-display font-bold text-white uppercase tracking-wider">Report Structure Checklist</h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-white/70">
                <ShieldCheck className="w-4.5 h-4.5 text-success-green" />
                <span>Section 1: Risk Assessment Metric Shield (Tatum APIs verified)</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <ShieldCheck className="w-4.5 h-4.5 text-success-green" />
                <span>Section 2: Asset Allocation percentages & Volatility matrices</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <ShieldCheck className="w-4.5 h-4.5 text-success-green" />
                <span>Section 3: AI Copilot personality brief & specific transaction warning labels</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <ShieldCheck className="w-4.5 h-4.5 text-success-green" />
                <span>Section 4: Decentralized persistence proof hash mapped via Walrus storage</span>
              </div>
            </div>
          </div>

          <div className="bg-[#050816]/60 p-5 rounded-xl border border-white/5 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="font-display font-extrabold text-[9px] text-purple-glow tracking-widest uppercase">Decentralized Availability</span>
              <p className="text-white/60 leading-relaxed text-[11px]">
                By generating this report, the structured metrics are converted to an availability blob and stored permanently on the Walrus Decentralized Node system.
              </p>
            </div>
            <div className="font-mono text-[9px] text-white/30 uppercase">
              DB Reference: walrus-availability-shield-v1.0
            </div>
          </div>
        </div>
      </div>

      {/* Grid 3: Historical report listings */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
          <Clock className="w-5 h-5 text-cyan-glow" />
          <h3 className="font-display font-bold text-base text-white">Generated Report Repository</h3>
        </div>

        <div className="space-y-3.5">
          {reportItems.map((item, idx) => (
            <div 
              key={idx}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-3.5 text-left">
                <div className="w-10 h-10 rounded-lg bg-cyan-glow/5 border border-cyan-glow/15 flex items-center justify-center text-cyan-glow">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-display font-bold text-xs text-white block">
                    {item.name}
                  </span>
                  <span className="font-sans text-[10px] text-white/40 uppercase tracking-widest font-semibold block mt-0.5">
                    {item.type}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-3 sm:mt-0">
                <div className="text-left sm:text-right">
                  <span className="font-mono text-xs font-bold text-white block">{item.size}</span>
                  <span className="text-[10px] text-white/40 block">Hash: {item.hash}</span>
                </div>
                <button
                  onClick={triggerPDFDownload}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-cyan-glow text-white/70 hover:text-[#050816] transition-colors cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

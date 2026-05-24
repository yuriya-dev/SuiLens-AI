'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, Terminal, ShieldAlert } from 'lucide-react';

export default function LoadingScanner() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { text: 'Establishing secure Tatum RPC channel to Sui Mainnet...', status: 'success' },
    { text: 'Extracting historical ledger entries (500 blocks scanned)...', status: 'success' },
    { text: 'Compiling token allocation ratios and protocol dependencies...', status: 'success' },
    { text: 'Evaluating behavioral risk triggers and whale connections...', status: 'success' },
    { text: 'Assembling dataset & publishing immutable proof to Walrus DB...', status: 'success' },
    { text: 'Synthesizing report via SuiLens AI Copilot Engine...', status: 'success' }
  ];

  useEffect(() => {
    // Progressively step through the logs
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 glass-panel border-cyan-glow/20 rounded-2xl max-w-2xl mx-auto overflow-hidden relative shadow-[0_0_50px_rgba(0,209,255,0.06)] min-h-[400px]">
      {/* Terminal grid and laser scanner sweep */}
      <div className="absolute inset-0 terminal-grid opacity-10 pointer-events-none" />
      <div className="scanner-line" />

      {/* Pulsing AI core icon */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full border border-cyan-glow/20 bg-cyan-glow/5 flex items-center justify-center animate-pulse">
          <Cpu className="w-10 h-10 text-cyan-glow" />
        </div>
        <div className="absolute inset-0 rounded-full border border-cyan-glow/30 animate-ping opacity-25" />
      </div>

      <h3 className="font-display font-extrabold text-2xl tracking-wider text-white mb-2">
        ONCHAIN INTELLIGENCE SCANNER
      </h3>
      <p className="font-sans text-xs text-white/40 uppercase tracking-widest mb-8">
        AI is profiling wallet behavior in real-time
      </p>

      {/* Scrolling technical mock terminal */}
      <div className="w-full bg-[#050816] rounded-xl border border-white/5 p-5 font-mono text-xs text-left space-y-2.5 max-h-[180px] overflow-y-auto relative">
        <div className="flex items-center gap-2 text-white/30 border-b border-white/5 pb-2 mb-3">
          <Terminal className="w-3.5 h-3.5 text-cyan-glow" />
          <span>CONSOLE TELEMETRY FEED (SUI-RPC-01)</span>
        </div>
        
        {steps.map((step, idx) => {
          if (idx > activeStep) return null;
          
          return (
            <div 
              key={idx} 
              className={`flex items-start gap-2.5 transition-all duration-300
                ${idx === activeStep ? 'text-cyan-glow font-bold' : 'text-white/60'}
              `}
            >
              <span className="text-white/20 select-none">[{new Date().toLocaleTimeString()}]</span>
              <span className="text-purple-glow">▶</span>
              <span className="flex-1">{step.text}</span>
              {idx < activeStep ? (
                <span className="text-success-green font-bold">[OK]</span>
              ) : (
                <span className="text-cyan-glow animate-pulse">[SCANNING]</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

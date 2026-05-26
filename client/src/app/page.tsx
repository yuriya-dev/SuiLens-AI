'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  ArrowRight, 
  Cpu, 
  Database, 
  ShieldAlert, 
  Activity, 
  FileText, 
  CheckCircle,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

export default function LandingPage() {
  const [typedText, setTypedText] = useState('');
  const [activeTab, setActiveTab] = useState<'scan' | 'whales' | 'walrus'>('scan');
  
  // Interactive Chat Simulation states
  const [demoChat, setDemoChat] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Ask me anything about any Sui address, e.g., "Is this wallet a smart accumulator?"' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sampleQuestions = [
    { q: "Is degentrader.sui considered smart money?", a: "Negative. This wallet has an 88% Risk Score, showing heavy speculative trading across unverified memecoins (FROG, TURBO). 95% of asset allocation is in highly volatile tokens." },
    { q: "Explain suilens.sui like I am 5.", a: "Think of this wallet as a very rich, wise dragon. Instead of buying shiny toys that break easily, this dragon keeps their golden coins (SUI, haSUI) safe in the strongest digital castles (Cetus, Scallop)." },
    { q: "Is this wallet exposed to smart contract bugs?", a: "Analyzing... The wallet has 90% of its capital locked inside yield-farming lending pools. While stable, it presents high systemic smart-contract exposure to Scallop and Navi." }
  ];

  const handleDemoQuestion = (q: string, a: string) => {
    if (isTyping) return;
    setDemoChat(prev => [...prev, { role: 'user', text: q }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setDemoChat(prev => [...prev, { role: 'assistant', text: a }]);
    }, 1500);
  };

  // Hero headline typing effect
  const words = ["Onchain Intelligence.", "Wallet Tracking.", "Rug Exposure Analysis.", "Smart Money Detection."];
  const [wordIdx, setWordIdx] = useState(0);
  const [subText, setSubText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentWord = words[wordIdx];
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setSubText(prev => prev.slice(0, -1));
      }, 40);
    } else {
      timer = setTimeout(() => {
        setSubText(prev => currentWord.slice(0, prev.length + 1));
      }, 70);
    }

    if (!isDeleting && subText === currentWord) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && subText === '') {
      setIsDeleting(false);
      setWordIdx(prev => (prev + 1) % words.length);
    }

    return () => clearTimeout(timer);
  }, [subText, isDeleting, wordIdx]);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-cyan-glow/5 blur-[120px] top-10 left-10 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-purple-glow/5 blur-[140px] bottom-10 right-10 pointer-events-none" />
      <div className="absolute inset-0 terminal-grid opacity-5 pointer-events-none" />

      {/* Header bar */}
      <nav className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-glow to-purple-glow flex items-center justify-center shadow-[0_0_20px_rgba(0,209,255,0.4)]">
            <Eye className="w-5 h-5 text-[#050816]" />
          </div>
          <span className="font-display font-bold text-xl tracking-wider bg-gradient-to-r from-cyan-glow to-purple-glow bg-clip-text text-transparent">
            SuiLens <span className="text-white text-xs opacity-75 ml-0.5">AI</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 hover:border-cyan-glow/40 bg-white/5 text-white/80 hover:text-white font-display text-sm font-semibold tracking-wide transition-all"
          >
            Launch App
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
        {/* Left copy */}
        <div className="lg:col-span-6 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-glow/10 border border-cyan-glow/20 text-cyan-glow text-xs font-display font-semibold tracking-widest uppercase">
            <Cpu className="w-4 h-4 animate-spin" />
            Next-Gen AI Onchain Intelligence
          </div>

          <h1 className="font-display font-extrabold text-5xl md:text-6xl tracking-tight leading-tight text-white">
            Your AI Copilot for <br />
            <span className="bg-gradient-to-r from-cyan-glow via-sui-blue to-purple-glow bg-clip-text text-transparent glow-text-cyan">
              {subText}
            </span>
            <span className="text-cyan-glow animate-pulse">|</span>
          </h1>

          <p className="font-sans text-lg text-white/60 leading-relaxed max-w-xl">
            Analyze wallets, identify smart money behaviors, detect rug pull exposures, and explore complex blockchain metrics instantly using natural language.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link 
              href="/wallet"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-glow to-sui-blue hover:from-sui-blue hover:to-cyan-glow text-[#050816] font-display font-bold rounded-xl tracking-wider uppercase text-sm shadow-[0_0_25px_rgba(0,209,255,0.3)] hover:shadow-[0_0_35px_rgba(0,209,255,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Analyze Wallet
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
            <Link 
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:border-white/30 text-white font-display font-bold rounded-xl tracking-wider uppercase text-sm transition-all flex items-center justify-center gap-2"
            >
              Try Demo View
            </Link>
          </div>
        </div>

        {/* Right Dashboard Animated Preview */}
        <div className="lg:col-span-6">
          <div className="glass-panel-cyan border-cyan-glow/20 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,209,255,0.05)] relative overflow-hidden group">
            <div className="absolute inset-0 terminal-grid opacity-10" />
            
            {/* Window header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              </div>
              <span className="font-mono text-xs text-white/40 tracking-wider">suilens-copilot-panel.terminal</span>
              <div className="w-4 h-4 rounded bg-white/10" />
            </div>

            {/* Simulated AI chat box inside preview */}
            <div className="space-y-4 min-h-[300px] flex flex-col justify-between">
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                {demoChat.map((msg, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 text-left ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role !== 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-glow to-purple-glow flex items-center justify-center shrink-0">
                        <Eye className="w-4 h-4 text-[#050816]" />
                      </div>
                    )}
                    <div className={`p-3.5 rounded-2xl text-xs max-w-[80%] leading-relaxed font-sans
                      ${msg.role === 'user' 
                        ? 'bg-cyan-glow/15 border border-cyan-glow/30 text-white rounded-tr-none' 
                        : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
                      }
                    `}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 justify-start items-center">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-glow to-purple-glow flex items-center justify-center shrink-0">
                      <Eye className="w-4 h-4 text-[#050816] animate-spin" />
                    </div>
                    <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce delay-200"></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sample question trigger prompts */}
              <div className="space-y-2.5 pt-4 border-t border-white/5">
                <span className="text-[10px] font-display font-semibold tracking-wider text-white/30 uppercase block text-left">
                  Click a quick question to test AI Copilot:
                </span>
                <div className="flex flex-col gap-2">
                  {sampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDemoQuestion(q.q, q.a)}
                      disabled={isTyping}
                      className="text-left text-[11px] font-sans px-3.5 py-2.5 rounded-xl border border-white/5 bg-white/2 hover:bg-cyan-glow/5 hover:border-cyan-glow/20 text-white/60 hover:text-white transition-all cursor-pointer truncate"
                    >
                      {q.q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="font-display font-semibold text-xs tracking-widest text-cyan-glow uppercase">INTELLIGENCE SUITE</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white">
            Designed for Deep Onchain Research
          </h2>
          <p className="font-sans text-white/50 text-sm">
            Everything you need to scan portfolios, uncover smart money, profile trades, and persist verification hashes, powered by AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-panel hover:border-cyan-glow/30 p-8 rounded-2xl space-y-4 transition-all duration-300 hover:-translate-y-1 text-left relative group">
            <div className="w-12 h-12 rounded-xl bg-cyan-glow/10 border border-cyan-glow/20 flex items-center justify-center text-cyan-glow">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">AI Wallet Analyzer</h3>
            <p className="font-sans text-sm text-white/50 leading-relaxed">
              Scan any Sui wallet. Get instant profiles, custom trading personalities, confidence matrices, and comprehensive behavioral summaries.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel hover:border-purple-glow/30 p-8 rounded-2xl space-y-4 transition-all duration-300 hover:-translate-y-1 text-left relative group">
            <div className="w-12 h-12 rounded-xl bg-purple-glow/10 border border-purple-glow/20 flex items-center justify-center text-purple-glow">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Rug Exposure Detection</h3>
            <p className="font-sans text-sm text-white/50 leading-relaxed">
              Identify scam tokens, trace honey-pots, track wallet clusters, and calculate overall portfolio volatility with custom warnings.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel hover:border-cyan-glow/30 p-8 rounded-2xl space-y-4 transition-all duration-300 hover:-translate-y-1 text-left relative group">
            <div className="w-12 h-12 rounded-xl bg-cyan-glow/10 border border-cyan-glow/20 flex items-center justify-center text-cyan-glow">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Whale Activity Tracker</h3>
            <p className="font-sans text-sm text-white/50 leading-relaxed">
              Monitor massive tokens movements and protocol allocations in real-time. Trace volume accumulation/distribution behaviors.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel hover:border-purple-glow/30 p-8 rounded-2xl space-y-4 transition-all duration-300 hover:-translate-y-1 text-left relative group">
            <div className="w-12 h-12 rounded-xl bg-purple-glow/10 border border-purple-glow/20 flex items-center justify-center text-purple-glow">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">AI Portfolio Reports</h3>
            <p className="font-sans text-sm text-white/50 leading-relaxed">
              Generate fully detailed, sleek research report packages complete with allocation charts, personality profiles, and PDF formats.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-panel hover:border-cyan-glow/30 p-8 rounded-2xl space-y-4 transition-all duration-300 hover:-translate-y-1 text-left relative group">
            <div className="w-12 h-12 rounded-xl bg-cyan-glow/10 border border-cyan-glow/20 flex items-center justify-center text-cyan-glow">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Walrus Decentralized Memory</h3>
            <p className="font-sans text-sm text-white/50 leading-relaxed">
              Maintain an immutable history log of all generated reports on Walrus storage, ensuring trustless persistence and verifiability.
            </p>
          </div>

          {/* Card 6 */}
          <div className="glass-panel hover:border-purple-glow/30 p-8 rounded-2xl space-y-4 transition-all duration-300 hover:-translate-y-1 text-left relative group">
            <div className="w-12 h-12 rounded-xl bg-purple-glow/10 border border-purple-glow/20 flex items-center justify-center text-purple-glow">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Tatum Core RPCs</h3>
            <p className="font-sans text-sm text-white/50 leading-relaxed">
              Leverage Tatum enterprise gateways to process wallet transaction histories and profile smart contracts at blistering speed.
            </p>
          </div>
        </div>
      </section>

      {/* Walrus Integration Callout */}
      <section className="max-w-7xl mx-auto px-6 py-20 bg-gradient-to-tr from-[rgba(139,92,246,0.06)] to-transparent border border-purple-glow/10 rounded-3xl mb-24 relative overflow-hidden text-left">
        <div className="absolute inset-0 terminal-grid opacity-5" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-glow/10 border border-purple-glow/20 text-purple-glow text-[10px] font-display font-bold tracking-wider uppercase">
              <Database className="w-3.5 h-3.5" />
              Verifiable Storage Architecture
            </div>
            <h2 className="font-display font-bold text-3xl text-white">
              Secured by Walrus Decentralized Storage
            </h2>
            <p className="font-sans text-sm text-white/60 leading-relaxed max-w-2xl">
              Every wallet report synthesized on SuiLens AI generates a cryptographic availability proof. The detailed JSON data and charts are uploaded directly as decentralized blobs onto the Walrus storage network. This allows researchers, investors, and developers to verify original AI analysis history cryptographically without relying on centralized databases.
            </p>
          </div>
          <div className="lg:col-span-4 flex justify-center">
            <div className="w-48 h-48 rounded-2xl border border-purple-glow/20 bg-purple-glow/5 flex flex-col items-center justify-center relative p-6 text-center group shadow-[0_0_30px_rgba(139,92,246,0.1)]">
              <Database className="w-16 h-16 text-purple-glow animate-bounce mb-3" />
              <span className="font-display font-extrabold text-xs text-white uppercase tracking-wider">IMMUTABLE ARCHIVE</span>
              <span className="font-mono text-[9px] text-white/40 mt-1">v1.2.0 Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-white/40 text-xs gap-4">
        <span>© 2026 SuiLens AI. All rights reserved.</span>
        <span>Sui Ecosystem Hackathon Demonstration Package</span>
      </footer>
    </div>
  );
}
